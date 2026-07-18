package api

import (
	_ "encoding/base64"
	"errors"
	db "game-wallet-api/internal/db/sqlc"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
)

type createPlayerRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
type playerResponse struct {
	ID        int64              `json:"id"`
	Username  string             `json:"username"`
	Email     string             `json:"email"`
	CreatedAt pgtype.Timestamptz `json:"created_at"`
	UpdatedAt pgtype.Timestamptz `json:"updated_at"`
}
type getPlayerRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}
type listPlayerRequest struct {
	Page     int32 `form:"page" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=10"`
}
type loginPlayerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
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

func (server Server) createPlayer(c *gin.Context) {
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

	arg := db.CreatePlayerParams{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}
	player, err := server.store.CreatePlayer(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	c.JSON(http.StatusCreated, newPlayerResponse(player))
}
func (server Server) getPlayer(c *gin.Context) {
	var req getPlayerRequest
	if err := c.ShouldBindUri(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	player, err := server.store.GetPlayerByID(c, req.ID)
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
func (server Server) loginPlayer(c *gin.Context) {
	var req loginPlayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	player, err := server.store.GetPlayerByEmail(c, req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, errorResponse(err))
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
	c.JSON(http.StatusOK, newPlayerResponse(player))
}
