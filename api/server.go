package api

import (
	db "game-wallet-api/internal/db/sqlc"

	"github.com/gin-gonic/gin"
)

// Server servers HTTP requests for our banking service
type Server struct {
	store  *db.Store
	router *gin.Engine
}

func NewServer(store *db.Store) *Server {
	server := &Server{store: store}
	router := gin.Default()
	router.POST("/players", server.createPlayer)
	router.GET("/players/:id", server.getPlayer)
	router.GET("/players", server.listPlayer)
	// add routes to router
	server.router = router
	return server
}

func (server Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
