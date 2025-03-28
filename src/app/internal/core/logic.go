package core

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"google.golang.org/api/option"
	youtube "google.golang.org/api/youtube/v3"
)

type Playlist struct {
	id string
	name string
	length int64
}

func (playlist Playlist) String() string {
	return fmt.Sprintf("Type {Playlist}\nid: %s\nname: %s\nlength: %d",
											playlist.id,
											playlist.name,
											playlist.length)
}

func LoadPlaylists(client *http.Client, ctx context.Context) []Playlist {
	yt, err := youtube.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("error creating YouTube service: %s", err)
	}

	call := yt.Playlists.List([]string{"snippet"}).Mine(true).MaxResults(10)
	resp, err := call.Do()
	if err != nil {
		log.Fatalf("error retrieving playlists: %s", err)
	}

	playlists := []Playlist{}	

	for _, item := range resp.Items {
		newPlaylist := Playlist{}
		newPlaylist.id = item.Id
		newPlaylist.name = item.Snippet.Title
		newPlaylist.length = item.ContentDetails.ItemCount

		playlists = append(playlists, newPlaylist)
	}

	return playlists
}
