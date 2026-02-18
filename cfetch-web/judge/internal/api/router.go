package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"judge/internal/judge"
	"judge/internal/model"
	"judge/internal/store"
)

type Server struct {
	judge *judge.Service
}

func NewServer(j *judge.Service) *Server {
	return &Server{judge: j}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.health)
	mux.HandleFunc("POST /v1/submissions", s.createSubmission)
	mux.HandleFunc("GET /v1/submissions/{id}", s.getSubmission)
	mux.HandleFunc("GET /v1/submissions/events/{id}", s.streamSubmissionEvents)
	mux.HandleFunc("GET /submissions/event/{id}", s.streamSubmissionEvents)
	mux.HandleFunc("GET /submissions/events/{id}", s.streamSubmissionEvents)
	return mux
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) createSubmission(w http.ResponseWriter, r *http.Request) {
	var req model.CreateSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}
	if req.TimeLimitMs <= 0 {
		req.TimeLimitMs = 2000
	}
	if req.MemoryLimitMB <= 0 {
		req.MemoryLimitMB = 256
	}
	if req.MaxOutputBytes <= 0 {
		req.MaxOutputBytes = 128 * 1024
	}

	sub, err := s.judge.Submit(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusAccepted, sub)
}

func (s *Server) getSubmission(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid submission id"})
		return
	}

	sub, err := s.judge.Get(id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}
	writeJSON(w, http.StatusOK, sub)
}

func (s *Server) streamSubmissionEvents(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid submission id"})
		return
	}

	current, err := s.judge.Get(id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	ch, cancel, err := s.judge.Subscribe(id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}
	defer cancel()

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "stream unsupported"})
		return
	}

	fmt.Fprint(w, "event: connected\ndata: {}\n\n")
	flusher.Flush()

	initial := model.Event{
		SubmissionID: current.ID,
		Status:       current.Status,
		Verdict:      current.Verdict,
		RuntimeMs:    current.RuntimeMs,
		At:           current.UpdatedAt,
	}
	initialPayload, _ := json.Marshal(initial)
	fmt.Fprintf(w, "event: status\ndata: %s\n\n", initialPayload)
	flusher.Flush()
	if current.Status == model.StatusDone {
		return
	}

	for {
		select {
		case <-r.Context().Done():
			return
		case evt, ok := <-ch:
			if !ok {
				return
			}
			payload, _ := json.Marshal(evt)
			fmt.Fprintf(w, "event: status\ndata: %s\n\n", payload)
			flusher.Flush()
			if evt.Status == model.StatusDone {
				return
			}
		}
	}
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}
