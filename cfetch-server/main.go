package main

import (
	"fmt"
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

	var v any
	for {
		err = wsjson.Read(r.Context(), c, &v)
		if err != nil {
			fmt.Println(err)
			return
		}
		log.Println("recieved:", v)
	}
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
