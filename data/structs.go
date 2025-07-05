package data

type APIResponse[T any] struct {
	Status string `json:"status"`
	Result []T    `json:"result"`
}

type Contest struct {
	ID               int    `json:"id"`
	Name             string `json:"name"`
	StartTimeSeconds int64  `json:"startTimeSeconds"`
	DurationSeconds  int64  `json:"durationSeconds"`
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
