package main

import (
	"echozone/backend/cmd"
	"echozone/backend/config"
)

//export run
func run() {
	_ = map[string]any{
		"ytStreamLink":  cmd.YTStreamLink,
		"saveSettings":  config.SaveSettings,
		"loadSettings":  config.LoadSettings,
	}
}
