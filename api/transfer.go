package api

import (
	"errors"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/token"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type transferRequest struct {
	ReceiverWalletID int64 `json:"receiver_wallet_id" binding:"required,min=1"`
	Amount           int64 `json:"amount" binding:"required,gt=0"`
}

func (server Server) createTransfer(c *gin.Context) {
	var req transferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Only the owner of the sender wallet is allowed to initiate the transfer.
	payload := c.MustGet(authorizationPayloadKey).(*token.Payload)
	senderWallet, err := server.store.GetWalletByPlayerID(c, payload.PlayerID)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Check if receiver wallet exists
	receiverWallet, err := server.store.GetWalletByPlayerID(c, req.ReceiverWalletID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if senderWallet.ID == receiverWallet.ID {
		err := errors.New("cannot transfer yourself")
		c.JSON(http.StatusConflict, errorResponse(err))
		return
	}
	arg := db.TransferTxParams{
		SenderWalletID:   senderWallet.ID,
		ReceiverWalletID: req.ReceiverWalletID,
		Amount:           req.Amount,
	}

	result, err := server.store.TransferTx(c, arg)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
