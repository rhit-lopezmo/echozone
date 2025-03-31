package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Settings struct {
	DefaultVolume int    `json:"defaultVolume"`
	Theme         string `json:"theme"`
}

func configPath() (string, error) {
	dirname, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dirname, "echozone", "settings.json"), nil
}

func SaveSettings(s Settings) error {
	path, err := configPath()
	if err != nil {
		return err
	}
	data, _ := json.MarshalIndent(s, "", "  ")
	err = os.MkdirAll(filepath.Dir(path), 0755)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func LoadSettings() (Settings, error) {
	path, err := configPath()
	if err != nil {
		return Settings{}, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return Settings{}, err
	}
	var s Settings
	err = json.Unmarshal(data, &s)
	return s, err
}
