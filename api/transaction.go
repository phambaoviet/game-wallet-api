package api

import (
	"fmt"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	result db.GetWalletTransactionsResult

	err error
)

type listTransactionsRequest struct {
	Page  int32  `form:"page" binding:"required,min=1"`
	Limit int32  `form:"limit" binding:"required,min=1,max=100"`
	Email string `form:"email"`
}

func (server Server) listWalletTransactions(ctx *gin.Context) {
	var req listTransactionsRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	payload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	wallet, err := server.store.GetWalletByPlayerID(ctx, payload.PlayerID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	fmt.Println("PlayerID:", payload.PlayerID)

	fmt.Println("WalletID:", wallet.ID)
}
