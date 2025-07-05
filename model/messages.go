package model

import (
	"github.com/charmbracelet/bubbles/table"
	"github.com/electr1fy0/cfetch/data"
)

type errMsg error

type loadedMsg struct {
	info        table.Model
	ratingTable table.Model
	ratingData  []data.RatingHistory
	ratingPlot  string
	submission  table.Model
	contests    table.Model
}
