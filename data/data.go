package data

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
	"unicode/utf8"

	"github.com/NimbleMarkets/ntcharts/linechart/timeserieslinechart"
	"github.com/charmbracelet/bubbles/table"

	"github.com/charmbracelet/lipgloss"
	"github.com/olekukonko/tablewriter"
)

type APIResponse[T any] struct {
	Status string `json:"status"`
	Result []T    `json:"result"`
}

type Contest struct {
	ID               int    `json:"id"`
	Name             string `json:"name"`
	StartTimeSeconds int64  `json:"startTimeSeconds"`
}

type RatingHistory struct {
	ContestID               int    `json:"contestID"`
	ContestName             string `json:"contestName"`
	Rank                    int    `json:"rank"`
	Handle                  string `json:"handle"`
	OldRating               int    `json:"oldRating"`
	NewRating               int    `json:"newRating"`
	RatingUpdateTimeSeconds int64  `json:"ratingUpdateTimeSeconds"`
}

type User struct {
	Rank      string `json:"rank"`
	Handle    string `json:"handle"`
	MaxRating int    `json:"maxRating"`
	Rating    int    `json:"rating"`
}

// Following two structs work together
type Submission struct {
	ContestID           int     `json:"contestId"`
	CreationTimeSeconds int64   `json:"creationTimeSeconds"`
	Problem             Problem `json:"problem"`
	Verdict             string  `json:"verdict"`
	ProgrammingLanguage string  `json:"programmingLanguage"`
}

type Problem struct {
	Name   string `json:"name"`
	Index  string `json:"index"`
	Rating *int   `json:"rating"`
}

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

func GetContests() table.Model {
	body := Request("https://codeforces.com/api/contest.list?gym=false")

	var apiResp APIResponse[Contest]

	err := json.Unmarshal(body, &apiResp)
	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
	}
	x := MakeContestsTable(&apiResp)
	return x
}
func truncate(s string, max int) string {
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	runes := []rune(s)
	return string(runes[:max]) + "..."
}

func MakeContestsTable(apiResp *APIResponse[Contest]) table.Model {
	// var buf bytes.Buffer

	cols := []table.Column{
		{Title: "Contest Name", Width: 50},
		{Title: "Start time", Width: 20}} // rm contestid

	var rows []table.Row
	for _, contest := range apiResp.Result[:min(10, len(apiResp.Result))] {
		startTime := time.Unix(contest.StartTimeSeconds, 0).Local().Format("02 Jan 2006 15:04")

		var row = table.Row{contest.Name, startTime}
		rows = append(rows, row)
	}
	t := table.New(
		table.WithColumns(cols),
		table.WithRows(rows),
		table.WithHeight(7),
		table.WithStyles(table.Styles{
			Header: lipgloss.NewStyle().
				Background(lipgloss.Color("#F5F5F5")).
				Foreground(lipgloss.Color("#333333")).
				Bold(true).
				Padding(0, 1).Height(1),

			Cell: lipgloss.NewStyle().
				Padding(0, 1),
		}),
	)
	// s := table.DefaultStyles()

	return t
}

func GetRatingHistory(handle string) string {
	url := fmt.Sprintf("https://codeforces.com/api/user.rating?handle=%s", handle)
	body := Request(url)

	var apiResp APIResponse[RatingHistory]
	err := json.Unmarshal(body, &apiResp)

	if err != nil {
		fmt.Println("Error umarshalling: ", err)
	}

	// PrintRatingHistory(apiResp)
	x := PlotRatingHistory(&apiResp)
	return x
}

func PrintRatingHistory(apiResp APIResponse[RatingHistory]) {
	table := tablewriter.NewWriter(os.Stdout)
	table.Header([]string{
		"Contest ID",
		"Title",
		// "Handle",
		"Rank",
		"Old Rating",
		"New Rating"})

	limit := len(apiResp.Result)

	for i := limit - 1; i >= 0; i-- {
		ratingItem := apiResp.Result[i]
		var row []string = []string{
			fmt.Sprintf("%d", ratingItem.ContestID),
			ratingItem.ContestName,
			// ratingItem.Handle,
			fmt.Sprintf("%d", ratingItem.Rank),
			fmt.Sprintf("%d", ratingItem.OldRating),
			fmt.Sprintf("%d", ratingItem.NewRating),
		}

		table.Append(row)
	}
	table.Render()
}
func PlotRatingHistory(apiResp *APIResponse[RatingHistory]) string {
	chart := timeserieslinechart.New(80, 18)

	chart.AxisStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#EBD391"))
	chart.LabelStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("6"))
	for _, item := range apiResp.Result {
		chart.Push(timeserieslinechart.TimePoint{
			Time:  time.Unix(item.RatingUpdateTimeSeconds, 0),
			Value: float64(item.NewRating),
		})
	}
	chart.DrawBraille()
	return chart.View()
}

func GetUserInfo(handle string) table.Model {
	url := fmt.Sprintf("https://codeforces.com/api/user.info?handles=%s&checkHistoricHandles=false", handle)

	body := Request(url)

	var apiResp APIResponse[User]
	err := json.Unmarshal(body, &apiResp)
	if err != nil {
		fmt.Println("Error unmarshalling:", err)
		os.Exit(1)
	}
	x := MakeInfoTable(apiResp, handle)

	return x
}

func MakeInfoTable(apiResp APIResponse[User], handle string) table.Model {
	cols := []table.Column{
		{Title: "Handle", Width: 20},
		{Title: "Rank", Width: 25},
		{Title: "Rating", Width: 10},
		{Title: "Max Rating", Width: 10},
	}
	rows := make([]table.Row, 0, 1)

	for i, user := range apiResp.Result {
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

	t := table.New(table.WithColumns(cols),
		table.WithRows(rows),
		table.WithHeight(2),
		table.WithStyles(
			table.Styles{
				Header: lipgloss.NewStyle().
					Background(lipgloss.Color("#F5F5F5")).
					Foreground(lipgloss.Color("#333333")).
					Bold(true).
					Padding(0, 1),

				Cell: lipgloss.NewStyle().
					Padding(0, 1),
			},
		))
	return t
}

func GetSubmissionHistory(handle string) table.Model {
	url := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s&from=1&count=10", handle)

	body := Request(url)

	var apiResp APIResponse[Submission]

	err := json.Unmarshal(body, &apiResp)
	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
	}

	return MakeSubmissionTable(apiResp, handle)
}

func MakeSubmissionTable(apiResp APIResponse[Submission], handle string) table.Model {
	cols := []table.Column{

		{Title: "Contest ID", Width: 8},
		{Title: "Difficulty", Width: 15},
		{Title: "Problem Name", Width: 20},
		{Title: "Verdict", Width: 10},
		// {Title: "Language", Width: 20},
		{Title: "Time", Width: 15},
	}
	var rows []table.Row
	for _, submission := range apiResp.Result {
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
	t := table.New(table.WithColumns(cols),
		table.WithRows(rows),
		table.WithHeight(10),
		table.WithStyles(
			table.Styles{
				Header: lipgloss.NewStyle().
					Background(lipgloss.Color("#F5F5F5")).
					Foreground(lipgloss.Color("#333333")).
					Bold(true).
					Padding(0, 1),

				Cell: lipgloss.NewStyle().
					Padding(0, 1),
			},
		))
	return t

}
