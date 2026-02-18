package main

import (
	"context"
	"judge/internal/api"
	"judge/internal/judge"
	"judge/internal/store"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

func main() {
	port := env("JUDGE_PORT", "8081")
	workerCount := envInt("JUDGE_WORKERS", 2)
	queueSize := envInt("JUDGE_QUEUE_SIZE", 256)

	st := store.NewMemoryStore()
	runner := judge.NewDockerRunner()
	svc := judge.NewService(st, runner, queueSize)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	svc.StartWorkers(ctx, workerCount)

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           api.NewServer(svc).Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("judge server listening on :%s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}

func env(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}

func envInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}
