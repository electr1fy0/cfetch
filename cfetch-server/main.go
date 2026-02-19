package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
)

type RoomManager struct {
	Rooms []*Room
}

var roomManager RoomManager

type Room struct {
	ID      uuid.UUID
	Clients map[string]*Client
	mu      sync.Mutex
}

type Client struct {
	Username string
	Conn     *websocket.Conn
}

type Handler struct {
}

// creates a new fresh room and returns a token
func (h *Handler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	client := Client{
		Username: "u1",
	}

	room := Room{
		ID:      uuid.New(),
		Clients: map[string]*Client{"u1": &client},
	}

	roomManager.Rooms = append(roomManager.Rooms, &room)
	fmt.Println(roomManager)
	fmt.Println(room.ID)

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

// {
//   "source_code": "int main(){return 0;}",
//   "language_id": 54,
//   "stdin": "input here",
//   "expected_output": "expected output",
//   "cpu_time_limit": 2,
//   "memory_limit": 128000,
//   "wall_time_limit": 5,
//   "redirect_stderr_to_stdout": true
// }

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

func (h *Handler) JoinRoom(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	roomID, _ := uuid.Parse(r.URL.Query().Get("room-id"))

	c, err := websocket.Accept(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	for _, room := range roomManager.Rooms {
		if room.ID == roomID {
			room.Clients[username] = &Client{
				Conn:     c,
				Username: username,
			}
		}
	}

	defer c.Close(websocket.StatusNormalClosure, "")

	var p SubmissionRequest
	client := &http.Client{}
	var judgeURL = "http://localhost:2358/submissions"
	for {
		err = wsjson.Read(r.Context(), c, &p)
		if err != nil {
			return
		}
		rawBytes, err := json.Marshal(p)
		if err != nil {
			fmt.Println(err)
			return
		}
		req, err := http.NewRequest("POST", judgeURL, bytes.NewReader(rawBytes))
		if err != nil {
			fmt.Println(err)
			return
		}

		req.Header.Add("Content-Type", "application/json")
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println(err)
			return
		}
		var token Token
		json.NewDecoder(resp.Body).Decode(&token)
		go func(Token string) {
			for {
				resp, err := http.Get(judgeURL + "/" + Token)
				if err != nil {
					fmt.Println(err)
					return
				}

				rawResp, err := io.ReadAll(resp.Body)
				if err != nil {
					fmt.Println(err)
					return
				}
				fmt.Println(string(rawResp))
			}
		}(token.Token)
	}
}

type Token struct {
	Token string `json:"token"`
}

func main() {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	h := Handler{}
	r.Post("/room", h.CreateRoom)
	r.Get("/ws/room", h.JoinRoom)

	server := http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	log.Fatal(server.ListenAndServe())

}
