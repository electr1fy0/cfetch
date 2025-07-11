package cmd

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/electr1fy0/cfetch/model"
	"github.com/spf13/cobra"
)

var cmd *cobra.Command = &cobra.Command{
	Use:   "cfetch",
	Short: "Fetch codeforces data from your terminal",
	Run: func(cmd *cobra.Command, args []string) {
		p := tea.NewProgram(model.InitialModel(Handle), tea.WithAltScreen())
		if _, err := p.Run(); err != nil {
			fmt.Println("Error:", err)
			os.Exit(1)
		}
	},
}

var Handle string

func init() {
	cmd.Flags().StringVar(&Handle, "handle", "", "Handle to fetch")
}

func Execute() error {
	return cmd.Execute()
}
