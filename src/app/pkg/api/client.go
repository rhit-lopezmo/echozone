package api

import (
	echozone "echozone/src/app/internal/core"
	"fmt"
)

func LoadPlaylistInfo(playlistUrl string) {
	playlist := echozone.LoadPlaylist(playlistUrl)

	fmt.Println(playlist.String())
}

