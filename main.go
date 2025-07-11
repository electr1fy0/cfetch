package main

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/electr1fy0/cfetch/cmd"
	"github.com/electr1fy0/cfetch/model"
)

func main() {
	if err := cmd.Execute(); err != nil {
		fmt.Println("Error with cobra: ", err)
		os.Exit(1)
	}
	p := tea.NewProgram(model.InitialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}
