package api

import (
	"context"
	echozone "echozone/src/app/internal/core"
	"fmt"
	"net/http"
)

func LoadPlaylistInfo(client *http.Client, ctx context.Context) {
	playlists := echozone.LoadPlaylists(client, ctx)

	for _, playlist := range playlists {
		fmt.Println(playlist.String())
	}
}

