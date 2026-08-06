package api

import (
	"fmt"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/token"
	"game-wallet-api/util"

	"github.com/gin-gonic/gin"
)

// Server servers HTTP requests for our banking service
type Server struct {
	config     util.Config
	store      *db.Store
	tokenMaker token.Maker
	router     *gin.Engine
}

func NewServer(config util.Config, store *db.Store) (*Server, error) {
	tokenMaker, err := token.NewJWTMaker(config.TokenKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create  maker: %w", err)
	}

	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}
	server.setupRouter()
	return server, nil
}
func (server *Server) setupRouter() {
	router := gin.Default()

	router.POST("/players", server.createPlayerTx)
	router.POST("/players/login", server.loginPlayer)
	authRouter := router.Group("/")
	authRouter.Use(authMiddleware(server.tokenMaker))
	adminRouter := authRouter.Group("/admin")
	adminRouter.Use(RequireRole(util.RoleAdmin))
	adminRouter.GET(
		"/transactions",
		server.listAllWalletTransactions,
	)

	authRouter.GET("/players/me", server.getMe)
	authRouter.GET("/wallets/me/transactions", server.listWalletTransactions)
	authRouter.POST("/transfers", server.createTransfer)

	// add routes to router
	server.router = router
}
func (server Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
