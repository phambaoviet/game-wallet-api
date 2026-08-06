package token

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt"
)

const minSecretKeySize = 32

type JWTMaker struct {
	secretKey string
}

func NewJWTMaker(secretKey string) (Maker, error) {
	if len(secretKey) < minSecretKeySize {
		return nil, errors.New("secret key too short")
	}
	return &JWTMaker{secretKey}, nil
}

func (maker *JWTMaker) CreateToken(playerID int64, username string, role string, duration time.Duration) (string, error) {
	payload, err := NewPayload(playerID, username, role, duration)
	if err != nil {
		return "", err
	}
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	return jwtToken.SignedString([]byte(maker.secretKey))
}
func (maker *JWTMaker) VerifyToken(token string) (*Payload, error) {
	// Check algorithm
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, ErrInvalidToken
		}
		return []byte(maker.secretKey), nil
	}
	// verify signature + parse payload
	jwtToken, err := jwt.ParseWithClaims(token, &Payload{}, keyFunc)
	if err != nil {
		var ver *jwt.ValidationError
		ok := errors.As(err, &ver)
		if ok && ver.Errors == jwt.ValidationErrorExpired {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}
	// extract payload
	payload, ok := jwtToken.Claims.(*Payload)
	if !ok {
		return nil, ErrInvalidToken
	}
	return payload, nil
}
