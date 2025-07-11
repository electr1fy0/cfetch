package main

import (
	"fmt"
	"os"

	"github.com/electr1fy0/cfetch/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		fmt.Println("Error with cobra: ", err)
		os.Exit(1)
	}

}
