package api

import (
	_ "encoding/base64"
	"errors"
	"fmt"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/token"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

type createPlayerRequest struct {
	Username string `json:"username" binding:"required,min=3,max=30"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}
type playerResponse struct {
	ID        int64              `json:"id"`
	Username  string             `json:"username"`
	Email     string             `json:"email"`
	CreatedAt pgtype.Timestamptz `json:"created_at"`
	UpdatedAt pgtype.Timestamptz `json:"updated_at"`
}

func newPlayerResponse(player db.Player) playerResponse {
	return playerResponse{
		ID:        player.ID,
		Username:  player.Username,
		Email:     player.Email,
		CreatedAt: player.CreatedAt,
		UpdatedAt: player.UpdatedAt,
	}
}

type listPlayerRequest struct {
	Page     int32 `form:"page" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=10"`
}
type loginPlayerRequest struct {
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"required"`
}

func (server Server) createPlayerTx(c *gin.Context) {
	var req createPlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	// Never store plaintext passwords in the database.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	result, err := server.store.CreatePlayerTx(c, db.CreatePlayerTxParams{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				c.JSON(http.StatusConflict, gin.H{"error": "username or email already exists"})
				return
			}
		}
		fmt.Printf("CreatePlayerTx error: %+v\n", err)
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	c.JSON(http.StatusCreated, newPlayerResponse(result.Player))
}
func (server Server) getMe(c *gin.Context) {
	// Authorize: Ensure the logged-in player only accesses their own resource
	payload := c.MustGet(authorizationPayloadKey).(*token.Payload)
	player, err := server.store.GetPlayerByID(c, payload.PlayerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newPlayerResponse(player))

}
func (server Server) listPlayer(c *gin.Context) {
	var req listPlayerRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	arg := db.ListPlayersParams{
		Limit:  req.PageSize,
		Offset: (req.Page-1)*req.PageSize + 1,
	}
	players, err := server.store.ListPlayers(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	rsp := make([]playerResponse, len(players))
	for i, player := range players {
		rsp[i] = newPlayerResponse(player)
	}
	c.JSON(http.StatusOK, rsp)
}

type loginPlayerResponse struct {
	AccessToken string         `json:"access_token"`
	Player      playerResponse `json:"player"`
}

func (server Server) loginPlayer(c *gin.Context) {
	var req loginPlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	player, err := server.store.GetPlayerByEmail(c, req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(player.PasswordHash), []byte(req.Password))

	if err != nil {
		c.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	accessToken, err := server.tokenMaker.CreateToken(player.ID, player.Email, server.config.AccessTokenDuration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	rsp := loginPlayerResponse{
		AccessToken: accessToken,
		Player:      newPlayerResponse(player),
	}
	c.JSON(http.StatusOK, rsp)
}
