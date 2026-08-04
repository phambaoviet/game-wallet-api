package api

import (
	"bytes"
	"encoding/json"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func randomString(n int) string {
	const alphabet = "abcdefghijklmnopqrstuvwxyz"
	var sb strings.Builder
	k := len(alphabet)
	for i := 0; i < n; i++ {
		c := alphabet[rand.Intn(k)]
		sb.WriteByte(c)
	}
	return sb.String()
}
func randomPlayerName() string {
	return randomString(10)
}
func randomEmail() string {
	return randomString(6) + "@example.com"
}

type randomPlayer struct {
	Username string
	Email    string
	Password string
}

func createRandomPlayer(t *testing.T, server *Server) randomPlayer {
	body := gin.H{
		"username": randomPlayerName(),
		"email":    randomEmail(),
		"password": "password_123",
	}

	data, err := json.Marshal(body)
	require.NoError(t, err)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodPost,
		"/players",
		bytes.NewReader(data),
	)
	require.NoError(t, err)

	request.Header.Set("Content-Type", "application/json")

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusCreated, recorder.Code)

	return randomPlayer{

		Username: body["username"].(string),
		Email:    body["email"].(string),
		Password: body["password"].(string),
	}
}
func TestCreatePlayerAPI(t *testing.T) {
	server := newTestServer(t, testStore)

	createRandomPlayer(t, server)
}
func loginPlayer(
	t *testing.T,
	server *Server,
	email string,
	password string,
) string {

	body := gin.H{
		"email":    email,
		"password": password,
	}

	data, err := json.Marshal(body)
	require.NoError(t, err)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(
		http.MethodPost,
		"/players/login",
		bytes.NewReader(data),
	)
	require.NoError(t, err)

	request.Header.Set("Content-Type", "application/json")

	server.router.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)

	var response loginPlayerResponse

	err = json.Unmarshal(recorder.Body.Bytes(), &response)
	require.NoError(t, err)

	require.NotEmpty(t, response.AccessToken)

	return response.AccessToken
}
