package model

import (
	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/table"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/electr1fy0/cfetch/data"
)

type screen int

const (
	Login screen = iota
	Loading
	Dashboard
	ContestAnalysis
)

type model struct {
	state                 screen
	textinput             textinput.Model
	info                  table.Model
	contests              table.Model
	ratingTable           table.Model
	contestSubmissions    table.Model
	submission            table.Model
	err                   error
	handle                string
	spinner               spinner.Model
	score                 int
	maxScore              int
	ratingPlot            string
	ratingData            []data.RatingHistory
	contestSubmissionList []data.Submission
	contestList           []data.Contest
	submissionList        []data.Submission
}
