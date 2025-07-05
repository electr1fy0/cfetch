package data

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
	"unicode/utf8"

	"github.com/NimbleMarkets/ntcharts/barchart"
	"github.com/NimbleMarkets/ntcharts/linechart/timeserieslinechart"
	"github.com/charmbracelet/bubbles/table"

	"github.com/charmbracelet/lipgloss"
)

func Request(url string) []byte {
	res, err := http.Get(url)
	if err != nil {
		fmt.Println("Error making the request: ", err)
		os.Exit(1)
	}

	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("Error parsing JSON: ", err)
		os.Exit(1)
	}
	return body
}

func FetchAPI[T any](url string) ([]T, error) {
	body := Request(url)
	var apiResp APIResponse[T]

	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, err
	}

	return apiResp.Result, nil
}

func MakeTable(cols []table.Column, rows []table.Row, focus bool) table.Model {
	return table.New(
		table.WithColumns(cols),
		table.WithRows(rows),
		table.WithHeight(7),
		table.WithFocused(focus),
		table.WithStyles(table.Styles{
			Header: lipgloss.NewStyle().
				Background(lipgloss.Color("#EED49F")).
				Foreground(lipgloss.Color("#333333")).
				Bold(true).
				Padding(0, 1).Height(1),

			Cell: lipgloss.NewStyle().
				Padding(0, 1),
			Selected: lipgloss.NewStyle().
				Foreground(lipgloss.Color("#111111")).
				Background(lipgloss.Color("#A6E3A1")),
		}),
	)

}

func GetContests() (table.Model, []Contest) {
	data, err := FetchAPI[Contest]("https://codeforces.com/api/contest.list?gym=false")

	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
	}
	x := MakeContestsTable(data)
	return x, data
}

func MakeContestsTable(result []Contest) table.Model {
	// var buf bytes.Buffer // for writing to bytes instead of stdout for other use cases

	cols := []table.Column{
		{Title: "Contest Name", Width: 60},
		{Title: "Start time", Width: 20}} // rm contestid

	var rows []table.Row
	for _, contest := range result[:min(10, len(result))] {
		startTime := time.Unix(contest.StartTimeSeconds, 0).Local().Format("02 Jan 2006 15:04")
		var row = table.Row{contest.Name, startTime}
		rows = append(rows, row)
	}
	t := MakeTable(cols, rows, false)

	return t
}

func GetRatingHistory(handle string) (table.Model, []RatingHistory, string) {
	url := fmt.Sprintf("https://codeforces.com/api/user.rating?handle=%s", handle)
	data, _ := FetchAPI[RatingHistory](url)

	for i, j := 0, len(data)-1; i < j; i, j = i+1, j-1 {
		data[i], data[j] = data[j], data[i]
	}
	x := PlotRatingHistory(data)
	y := MakeRatingTable(data)

	return y, data, x
}

func GetUserInfo(handle string) (table.Model, []User) {
	url := fmt.Sprintf("https://codeforces.com/api/user.info?handles=%s&checkHistoricHandles=false", handle)

	data, err := FetchAPI[User](url)
	if err != nil {
		fmt.Println("Error fetching user info: ", err)
		os.Exit(1)
	}
	x := MakeInfoTable(data)

	return x, data
}

func GetSubmissionHistory(handle string) (table.Model, []Submission, string) {
	url := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s", handle)

	data, err := FetchAPI[Submission](url)
	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
		os.Exit(1)
	}

	return MakeSubmissionTable(data), data, MakeSubmissionDistributionChart(data)
}

func MakeSubmissionDistributionChart(result []Submission) string {

	ratingRanges := []struct {
		min   int
		max   int
		label string
		color string
	}{
		{800, 1199, "800-1199", "10"},   // green - newbie/pupil
		{1200, 1599, "1200-1599", "14"}, // cyan - specialist
		{1600, 1899, "1600-1899", "4"},  // blue - expert
		{1900, 2199, "1900-2199", "5"},  // purple - candidate master
		{2200, 2499, "2200-2499", "11"}, // yellow - master
		{2500, 2999, "2500-2999", "9"},  // red - international master
		{3000, 3500, "3000+", "1"},      // dark red - grandmaster+
	}

	counts := make(map[string]int)
	totalSubmissions := 0

	for _, submission := range result {

		if submission.Problem.Rating == nil {
			continue
		}

		rating := *submission.Problem.Rating
		totalSubmissions++

		for _, rng := range ratingRanges {
			if rating >= rng.min && (rng.label == "3000+" || rating <= rng.max) {
				counts[rng.label]++
				break
			}
		}
	}

	var barData []barchart.BarData

	for _, rng := range ratingRanges {
		count := counts[rng.label]
		if count > 0 {
			percentage := float64(count) / float64(totalSubmissions) * 100

			barData = append(barData, barchart.BarData{
				Label: rng.label,
				Values: []barchart.BarValue{
					{
						fmt.Sprintf("%d (%.1f%%)", count, percentage),
						float64(count),
						lipgloss.NewStyle().Foreground(lipgloss.Color(rng.color)),
					},
				},
			})
		}
	}

	// Create and configure the chart
	bc := barchart.New(60, 12)
	bc.PushAll(barData)
	bc.Draw()

	return fmt.Sprintf("Problem Difficulty Distribution (Total: %d)\n%s",
		totalSubmissions, bc.View())
}
func GetContestSubmissions(contestID int, handle string) (table.Model, []Submission) {
	url := fmt.Sprintf("https://codeforces.com/api/contest.status?contestId=%d&handle=%s&from=1&count=20", contestID, handle)

	data, err := FetchAPI[Submission](url)
	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
		os.Exit(1)
	}
	return MakeContestSubmissionTable(data), data
}

func MakeInfoTable(result []User) table.Model {
	cols := []table.Column{
		{Title: "Handle", Width: 20},
		{Title: "Rank", Width: 25},
		{Title: "Rating", Width: 10},
		{Title: "Max Rating", Width: 10},
	}
	rows := make([]table.Row, 0, 1)

	for i, user := range result {
		row := table.Row{
			user.Handle,
			user.Rank,
			fmt.Sprintf("%d", user.Rating),
			fmt.Sprintf("%d", user.MaxRating),
		}
		if i == 1 {
			break
		}
		rows = append(rows, row)
	}

	t := MakeTable(cols, rows, false)
	return t
}

func MakeContestSubmissionTable(result []Submission) table.Model {
	cols := []table.Column{
		{Title: "Problem", Width: 10},
		{Title: "Name", Width: 30},
		{Title: "Difficulty", Width: 10},
		{Title: "Verdict", Width: 12},
		{Title: "Time", Width: 15},
	}

	var rows []table.Row
	for _, submission := range result {
		var difficulty string
		if submission.Problem.Rating == nil {
			difficulty = "N/A"
		} else {
			difficulty = fmt.Sprintf("%d", *submission.Problem.Rating)
		}

		problemLabel := fmt.Sprintf("%s%d", submission.Problem.Index, submission.Problem.ContestID)
		submitTime := time.Unix(submission.CreationTimeSeconds, 0).Local().Format("02 Jan 2006")

		row := table.Row{
			problemLabel,
			submission.Problem.Name,
			difficulty,
			submission.Verdict,
			submitTime,
		}
		rows = append(rows, row)
	}

	t := MakeTable(cols, rows, false)
	return t
}

func MakeRatingTable(result []RatingHistory) table.Model {
	cols := []table.Column{
		{Title: "Contest ID", Width: 10},
		{Title: "Title", Width: 40},
		{Title: "Rank", Width: 5},
		{Title: "Old Rating", Width: 10},
		{Title: "New Rating", Width: 10},
	}

	var rows []table.Row

	limit := len(result)

	for i := 0; i < limit; i++ {
		ratingItem := result[i]
		var row table.Row = []string{
			fmt.Sprintf("%d", ratingItem.ContestID),
			ratingItem.ContestName,
			// ratingItem.Handle,
			fmt.Sprintf("%d", ratingItem.Rank),
			fmt.Sprintf("%d", ratingItem.OldRating),
			fmt.Sprintf("%d", ratingItem.NewRating),
		}

		rows = append(rows, row)
	}
	t := MakeTable(cols, rows, true)

	return t

}

func PlotRatingHistory(result []RatingHistory) string {
	chart := timeserieslinechart.New(80, 18)

	chart.AxisStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#EBD391"))
	chart.LabelStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("6"))
	for _, item := range result {
		chart.Push(timeserieslinechart.TimePoint{
			Time:  time.Unix(item.RatingUpdateTimeSeconds, 0),
			Value: float64(item.NewRating),
		})
	}
	chart.DrawBraille()
	return chart.View()
}

func truncate(s string, max int) string {
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	runes := []rune(s)
	return string(runes[:max]) + "..."
}

func MakeSubmissionTable(result []Submission) table.Model {
	cols := []table.Column{
		{Title: "Contest ID", Width: 10},
		{Title: "Difficulty", Width: 10},
		{Title: "Problem Name", Width: 30},
		{Title: "Verdict", Width: 12},
		// {Title: "Language", Width: 20},
		{Title: "Time", Width: 15},
	}
	var rows []table.Row
	for _, submission := range result {
		var difficulty string
		if submission.Problem.Rating == nil {
			difficulty = "N/A"
		} else {
			difficulty = fmt.Sprintf("%d", *submission.Problem.Rating)
		}

		startTime := time.Unix(submission.CreationTimeSeconds, 0).Local().Format("02 Jan 2006")

		var row []string = table.Row{
			fmt.Sprintf("%d", submission.ContestID),
			difficulty,
			submission.Problem.Name,
			submission.Verdict,
			// submission.ProgrammingLanguage,
			startTime,
		}
		rows = append(rows, row)
	}
	t := MakeTable(cols, rows, false)
	return t
}
