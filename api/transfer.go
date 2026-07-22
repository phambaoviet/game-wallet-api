package api

import (
	db "game-wallet-api/internal/db/sqlc"
	"net/http"

	"github.com/gin-gonic/gin"
)

type transferRequest struct {
	SenderWalletID   int64 `json:"sender_wallet_id" binding:"required,min=1"`
	ReceiverWalletID int64 `json:"receiver_wallet_id" binding:"required,min=1"`
	Amount           int64 `json:"amount" binding:"required,gt=0"`
}

func (server Server) createTransfer(c *gin.Context) {
	var req transferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	arg := db.TransferTxParams{
		SenderWalletID:   req.SenderWalletID,
		ReceiverWalletID: req.ReceiverWalletID,
		Amount:           req.Amount,
	}
	if req.SenderWalletID == req.ReceiverWalletID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sender wallet id cannot be equal to receiver wallet id"})
		return
	}
	result, err := server.store.TransferTx(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
