package store

import (
	"errors"
	"judge/internal/model"
	"sync"
	"time"
)

var ErrNotFound = errors.New("submission not found")

type MemoryStore struct {
	mu          sync.RWMutex
	submissions map[string]*model.Submission
	watchers    map[string]map[chan model.Event]struct{}
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		submissions: make(map[string]*model.Submission),
		watchers:    make(map[string]map[chan model.Event]struct{}),
	}
}

func (s *MemoryStore) Create(sub model.Submission) model.Submission {
	s.mu.Lock()
	defer s.mu.Unlock()
	cpy := sub
	s.submissions[sub.ID] = &cpy
	return cpy
}

func (s *MemoryStore) Get(id string) (model.Submission, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sub, ok := s.submissions[id]
	if !ok {
		return model.Submission{}, ErrNotFound
	}
	return *sub, nil
}

func (s *MemoryStore) Update(id string, update func(*model.Submission)) (model.Submission, error) {
	s.mu.Lock()
	sub, ok := s.submissions[id]
	if !ok {
		s.mu.Unlock()
		return model.Submission{}, ErrNotFound
	}
	update(sub)
	sub.UpdatedAt = time.Now().UTC()
	updated := *sub
	watchers := s.watchers[id]
	s.mu.Unlock()

	event := model.Event{
		SubmissionID: updated.ID,
		Status:       updated.Status,
		Verdict:      updated.Verdict,
		RuntimeMs:    updated.RuntimeMs,
		At:           updated.UpdatedAt,
	}

	for ch := range watchers {
		select {
		case ch <- event:
		default:
		}
	}

	return updated, nil
}

func (s *MemoryStore) Subscribe(id string) (<-chan model.Event, func()) {
	ch := make(chan model.Event, 16)

	s.mu.Lock()
	if _, ok := s.watchers[id]; !ok {
		s.watchers[id] = make(map[chan model.Event]struct{})
	}
	s.watchers[id][ch] = struct{}{}
	s.mu.Unlock()

	cancel := func() {
		s.mu.Lock()
		if subs, ok := s.watchers[id]; ok {
			delete(subs, ch)
			if len(subs) == 0 {
				delete(s.watchers, id)
			}
		}
		s.mu.Unlock()
		close(ch)
	}

	return ch, cancel
}
