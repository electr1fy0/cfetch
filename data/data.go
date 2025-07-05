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
type Submission struct {
	ID                  int     `json:"id"`
	ContestID           int     `json:"contestId"`
	CreationTimeSeconds int64   `json:"creationTimeSeconds"`
	RelativeTimeSeconds int64   `json:"relativeTimeSeconds"`
	Problem             Problem `json:"problem"`
	Author              Author  `json:"author"`
	ProgrammingLanguage string  `json:"programmingLanguage"`
	Verdict             string  `json:"verdict"`
	Testset             string  `json:"testset"`
	PassedTestCount     int     `json:"passedTestCount"`
	TimeConsumedMillis  int     `json:"timeConsumedMillis"`
	MemoryConsumedBytes int     `json:"memoryConsumedBytes"`
}

type Problem struct {
	ContestID int      `json:"contestId"`
	Index     string   `json:"index"`
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Points    float64  `json:"points,omitempty"`
	Rating    *int     `json:"rating,omitempty"`
	Tags      []string `json:"tags"`
}

type Author struct {
	ContestID        int      `json:"contestId"`
	Members          []Member `json:"members"`
	ParticipantType  string   `json:"participantType"`
	Ghost            bool     `json:"ghost"`
	StartTimeSeconds *int64   `json:"startTimeSeconds,omitempty"`
}

type Member struct {
	Handle string `json:"handle"`
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

func FetchAPI[T any](url string) ([]T, error) {
	body := Request(url)
	var apiResp APIResponse[T]

	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, err
	}

	return apiResp.Result, nil
}

func GetContests() table.Model {
	data, err := FetchAPI[Contest]("https://codeforces.com/api/contest.list?gym=false")

	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
	}
	x := MakeContestsTable(data)
	return x
}

func truncate(s string, max int) string {
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	runes := []rune(s)
	return string(runes[:max]) + "..."
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

	// PrintRatingHistory(apiResp)
	x := PlotRatingHistory(data)
	y := MakeRatingTable(data)

	return y, data, x
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

	for i := limit - 1; i >= 0; i-- {
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

	t := MakeTable(cols, rows, false)
	return t
}

func GetSubmissionHistory(handle string) table.Model {
	url := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s&from=1&count=10", handle)

	data, err := FetchAPI[Submission](url)
	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
		os.Exit(1)
	}

	return MakeSubmissionTable(data)
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

func GetContestSubmissions(contestID int, handle string) table.Model {
	url := fmt.Sprintf("https://codeforces.com/api/contest.status?contestId=%d&handle=%s&from=1&count=10", contestID, handle)

	data, err := FetchAPI[Submission](url)
	if err != nil {
		fmt.Println("Error unmarshalling: ", err)
		os.Exit(1)
	}
	return MakeContestSubmissionTable(data)
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
