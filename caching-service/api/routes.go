package api

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Router struct {
	handler *APIHandler
	upgrader websocket.Upgrader
}

func NewRouter(handler *APIHandler) *Router {
	return &Router{
		handler: handler,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins in development
			},
		},
	}
}

func (r *Router) SetupRoutes() *mux.Router {
	router := mux.NewRouter()
	
	// API versioning
	api := router.PathPrefix("/api/v1").Subrouter()
	
	// Health check
	api.HandleFunc("/health", r.handler.HealthCheck).Methods("GET")
	
	// Wallet endpoints
	api.HandleFunc("/wallet/{address}", r.handler.GetWalletData).Methods("GET")
	api.HandleFunc("/wallet/{address}/stats", r.handler.GetWalletStats).Methods("GET")
	api.HandleFunc("/wallets/top", r.handler.GetTopWallets).Methods("GET")
	
	// Deal endpoints
	api.HandleFunc("/deals", r.handler.GetDeals).Methods("GET")
	api.HandleFunc("/deals/{address}", r.handler.GetDeal).Methods("GET")
	
	// Arbiter endpoints
	api.HandleFunc("/arbiters", r.handler.GetArbiters).Methods("GET")
	api.HandleFunc("/arbiters/{address}", r.handler.GetArbiter).Methods("GET")
	
	// WebSocket endpoint for real-time updates
	api.HandleFunc("/ws", r.handleWebSocket).Methods("GET")
	
	// CORS middleware
	router.Use(corsMiddleware)
	
	return router
}

func (r *Router) handleWebSocket(w http.ResponseWriter, req *http.Request) {
	conn, err := r.upgrader.Upgrade(w, req, nil)
	if err != nil {
		http.Error(w, "Could not upgrade connection", http.StatusBadRequest)
		return
	}
	defer conn.Close()
	
	// Handle WebSocket connection
	// This would typically involve:
	// 1. Registering the client for updates
	// 2. Sending real-time event updates
	// 3. Handling client disconnection
	
	// For now, just keep the connection alive
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}
