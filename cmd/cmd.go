package cmd

import (
	"github.com/electr1fy0/cfetch/model"
	"github.com/spf13/cobra"
)

// Currently WIP and broken

var cmd *cobra.Command = &cobra.Command{
	Use:   "cfetch",
	Short: "Fetch codeforces data from your terminal",
	Run: func(cmd *cobra.Command, args []string) {
		func Execute() {
			p := tea.NewProgram(InitialModel(), tea.WithAltScreen())
			if _, err := p.Run(); err != nil {
				fmt.Println("Error:", err)
				os.Exit(1)
			}
}	},
}

// 	cmd.AddCommand(&cobra.Command{
// 		Use:   "rating [handle]",
// 		Short: "Show rating history",
// 		Args:  cobra.ExactArgs(1),
// 		Run: func(cmd *cobra.Command, args []string) {
// 			GetRatingHistory(args[0])
// 		},
// 	})

// 	cmd.AddCommand(&cobra.Command{
// 		Use:   "info [handle]",
// 		Short: "Show user info",
// 		Args:  cobra.ExactArgs(1),
// 		Run: func(cmd *cobra.Command, args []string) {
// 			GetUserInfo(args[0])
// 		},
// 	})

// 	cmd.AddCommand(&cobra.Command{
// 		Use:   "submissions [handle]",
// 		Short: "Show recent submissions",
// 		Args:  cobra.ExactArgs(1),
// 		Run: func(cmd *cobra.Command, args []string) {
// 			GetSubmissionHistory(args[0])
// 		},
// 	})

// 	if err := fang.Execute(context.Background(), cmd); err != nil {
// 		fmt.Fprintln(os.Stderr, err)
// 		os.Exit(1)
// 	}

// }

var Handle string

func init() {
	cmd.Flags().StringVar(&Handle, "handle", "", "Handle to fetch")
}

func Execute() error {
	return cmd.Execute()
}
