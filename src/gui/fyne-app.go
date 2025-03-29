package main

import (
	"fmt"

	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

func main() {
	a := app.New()
	w := a.NewWindow("Echozone - Test")

	label := widget.NewLabel("Waiting for action...")

	button := widget.NewButton("Click Me", func() {
		label.SetText("You clicked it!")
		fmt.Println("Button clicked")
	})

	w.SetContent(container.NewVBox(
		widget.NewLabel("Hello from Fyne"),
		button,
		label,
	))

	w.Resize(fyne.NewSize(300, 200))
	w.ShowAndRun()
}
