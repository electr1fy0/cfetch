package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	db "cfetch/internal/db"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var judgeURL = "http://localhost:2358/submissions"

type RoomManager struct {
	mu    sync.RWMutex
	Rooms map[uuid.UUID]*Room
}

var roomManager = RoomManager{
	Rooms: make(map[uuid.UUID]*Room),
}

type Room struct {
	ID      uuid.UUID
	Clients map[string]*Client

	events chan RoomEvent
	mu     sync.RWMutex
}

type RoomEventType int

const (
	EventJoin RoomEventType = iota
	EventLeave
	EventSubmission
)

type RoomEvent struct {
	Type     RoomEventType
	Username string
	StatusID int
	Client   *Client
	Verdict  string
}

type Client struct {
	Username    string
	Conn        *websocket.Conn
	Submitted   bool
	LastStatus  int
	LastVerdict string
}

type Handler struct {
	queries *db.Queries
}

func (rm *RoomManager) addRoom(room *Room) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	rm.Rooms[room.ID] = room
}

// getRoom returns the room pointer from the shared index.
func (rm *RoomManager) getRoom(id uuid.UUID) (*Room, bool) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	room, ok := rm.Rooms[id]
	return room, ok
}

// addClient is the only place that mutates room membership.
func (r *Room) addClient(c *Client) {
	r.Clients[c.Username] = c
}

func (r *Room) removeClient(username string) {
	delete(r.Clients, username)
}

// markSubmitted records the latest finalized verdict for a user in this room.
func (r *Room) markSubmitted(username string, statusID int, verdict string) bool {
	client, ok := r.Clients[username]
	if !ok {
		return false
	}
	client.Submitted = true
	client.LastStatus = statusID
	client.LastVerdict = verdict
	return true
}

// All room activities are handled here
// Nowhere else is room modified
func (r *Room) Run() {
	for event := range r.events {
		switch event.Type {
		case EventJoin:
			r.addClient(event.Client)
			msg := BroadcastMessage{
				Username:    event.Username,
				MessageType: "Join",
				Message:     fmt.Sprintf("%s has joined", event.Username),
			}
			r.Broadcast(msg)
		case EventLeave:
			r.removeClient(event.Username)

		case EventSubmission:
			fmt.Println(event.Verdict)
			msg := BroadcastMessage{
				Username:    event.Username,
				MessageType: "Submission",

				Message: fmt.Sprintf("%s has submitted and has got %s", event.Username, event.Verdict),
			}
			r.Broadcast(msg)
		}
	}
}

type BroadcastMessage struct {
	Username string `json:"src_user"`

	// TODO: this should be a type of consts.
	MessageType string // tbd

	Message string `json:"message"`
}

// You give all signals through this and this only
// Probably logs should go through this but tbd is
// to filter out the user whose log it is and don't show it to him
// maybe fine to do it client side for now.
func (r *Room) Broadcast(msg BroadcastMessage) {
	for _, c := range r.Clients {
		wsjson.Write(context.Background(), c.Conn, msg)
	}
}

// CreateRoom creates an empty duel room. Users are added only via JoinRoom.
func (h *Handler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	room := Room{
		ID:      uuid.New(),
		Clients: map[string]*Client{},
		events:  make(chan RoomEvent, 64),
	}

	roomManager.addRoom(&room)

	go room.Run()
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "%s", room.ID)
}

type SubmissionResponse struct {
	Stdout        *string `json:"stdout"`
	Time          string  `json:"time"`
	Memory        int     `json:"memory"`
	Stderr        *string `json:"stderr"`
	Token         string  `json:"token"`
	CompileOutput *string `json:"compile_output"`
	Message       *string `json:"message"`
	Status        Status  `json:"status"`
}

type Status struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
}

type SubmissionRequest struct {
	SourceCode             string `json:"source_code"`
	LanguageID             int    `json:"language_id"`
	Stdin                  string `json:"stdin"`
	ExpectedOutput         string `json:"expected_output"`
	CPUTimeLimit           int    `json:"cpu_time_limit"`
	MemoryLimit            int    `json:"memory_limit"`
	WallTimeLimit          int    `json:"wall_time_limit"`
	RedirectStderrToStdout bool   `json:"redirect_stderr_to_stdout"`
}

type SubmissionResult struct {
	StatusID   int    `json:"status_id"`
	StatusDesc string `json:"status_desc"`
	Done       bool   `json:"done"`
}

type Token struct {
	Token string `json:"token"`
}

// submitAndWait sends one submission to Judge0 and blocks until a final verdict.
// Judge0 statuses 1 and 2 are non-final (queued/processing), everything else is terminal.
func (r *Room) submitAndWait(username string, payload SubmissionRequest) {
	rawBytes, err := json.Marshal(payload)
	if err != nil {
		return
	}

	req, err := http.NewRequest("POST", judgeURL, bytes.NewReader(rawBytes))
	if err != nil {
		return
	}
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return
	}

	var token Token
	err = json.NewDecoder(resp.Body).Decode(&token)
	if err != nil {
		return
	}

	resp.Body.Close()

	// at this point we've submitted the code
	// and we get the token, should broadcast to everyone
	r.events <- RoomEvent{
		Username: username,
		Type:     EventSubmission,
		Verdict:  "Pending",
	}
	for {
		resp, err := client.Get(judgeURL + "/" + token.Token)
		if err != nil {
			return
		}

		var judgeResp SubmissionResponse
		err = json.NewDecoder(resp.Body).Decode(&judgeResp)
		resp.Body.Close()
		if err != nil {
			return
		}

		r.events <- RoomEvent{
			Username: username,
			Type:     EventSubmission,
			StatusID: judgeResp.Status.ID,
			Verdict:  judgeResp.Status.Description,
		}

		if judgeResp.Status.ID != 2 && judgeResp.Status.ID != 1 {
			break
		}

		// TODO: rethink the duration
		time.Sleep(time.Second * 2)
	}
}

// JoinRoom upgrades to websocket, sends an event to add user to the room
// and processes each incoming submission request sequentially.
func (h *Handler) JoinRoom(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	roomIDParam := chi.URLParam(r, "roomID")
	if username == "" {
		http.Error(w, "missing username path param", http.StatusBadRequest)
		return
	}

	roomID, err := uuid.Parse(roomIDParam)
	if err != nil {
		http.Error(w, "invalid roomID path param", http.StatusBadRequest)
		return
	}

	c, err := websocket.Accept(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer c.Close(websocket.StatusNormalClosure, "")

	roomCurr, ok := roomManager.getRoom(roomID)
	if !ok {
		_ = c.Close(websocket.StatusPolicyViolation, "room not found")
		return
	}

	roomClient := &Client{Conn: c, Username: username}
	roomCurr.events <- RoomEvent{
		Type:     EventJoin,
		Username: username,
		Client:   roomClient,
	}

	// Keep room membership consistent with websocket connection lifetime.
	defer func() {
		roomCurr.events <- RoomEvent{
			Type:     EventLeave,
			Username: username,
			Client:   roomClient,
		}
	}()

	for {
		var req SubmissionRequest
		err = wsjson.Read(r.Context(), c, &req)
		if err != nil {
			return
		}

		go roomCurr.submitAndWait(username, req)

	}
}

func (r *RoomManager) deleteRoom(id uuid.UUID) {
	room := r.Rooms[id]

	for _, c := range room.Clients {
		c.Conn.Write(context.Background(), websocket.MessageText, []byte("x won"))
		c.Conn.Close(websocket.StatusNormalClosure, "")
	}

	delete(roomManager.Rooms, id)
}

func (h *Handler) GetSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authjs.session-token")
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	session, err := h.queries.GetSessionWithUser(r.Context(), cookie.Value)
	if errors.Is(err, pgx.ErrNoRows) {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	if err != nil {
		http.Error(w, "failed to fetch session", http.StatusInternalServerError)
		return
	}

	email := ""
	if session.Email.Valid {
		email = session.Email.String
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]any{
		"userId":       session.ID,
		"email":        email,
		"expires":      session.Expires.Time,
		"sessionToken": cookie.Value,
	}); err != nil {
		http.Error(w, "failed to encode session", http.StatusInternalServerError)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://*"},
		AllowCredentials: true,
	}))

	h := Handler{queries: db.New(pool)}
	r.Post("/room", h.CreateRoom)
	r.Get("/session", h.GetSession)
	r.Get("/ws/room/{roomID}/{username}", h.JoinRoom)

	server := http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	fmt.Println("Starting server on :8080...")
	log.Fatal(server.ListenAndServe())
}
