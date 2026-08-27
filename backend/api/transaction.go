package api

import (
	"errors"
	db "game-wallet-api/internal/db/sqlc"
	"game-wallet-api/token"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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
type claimDemoFaucetRequest struct {
}

func (server Server) listWalletTransactions(ctx *gin.Context) {
	var req listTransactionsRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	payload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get wallet of current logged-in player
	wallet, err := server.store.GetWalletByPlayerID(ctx, payload.PlayerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "wallet not found",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Calculate pagination offset
	offset := (req.Page - 1) * req.Limit

	// Get transactions belonging to this wallet
	transactions, err := server.store.ListWalletTransactions(
		ctx,
		db.ListWalletTransactionsParams{
			WalletID: wallet.ID,
			Limit:    req.Limit,
			Offset:   offset,
		},
	)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": transactions,
	})
}
func (server Server) claimDemoFaucet(ctx *gin.Context) {
	payload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	wallet, err := server.store.GetWalletByPlayerID(ctx, payload.PlayerID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	result, err := server.store.ClaimDemoFaucetTx(
		ctx,
		db.ClaimDemoFaucetTxParams{
			WalletID: wallet.ID,
			Amount:   10000,
		},
	)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, result)
}
