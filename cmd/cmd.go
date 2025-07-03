// package cmd

// Currently WIP and broken

// import (
// 	"context"
// 	"fmt"
// 	"os"

// 	"github.com/charmbracelet/fang"
// 	"github.com/spf13/cobra"
// )

// func Cmd() {
// 	cmd := &cobra.Command{
// 		Use:   "cfetch",
// 		Short: "Fetch codeforces data from your terminal",
// 	}

// 	cmd.AddCommand(&cobra.Command{
// 		Use:   "contests",
// 		Short: "Show latest contests",
// 		Run: func(cmd *cobra.Command, args []string) {
// 			GetContests()
// 		},
// 	})

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
