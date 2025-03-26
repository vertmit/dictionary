// Gets the element that controls the word of the day
const wordOfTheDayHolder = document.getElementById("wordOfTheDay")
const wordOfTheDayTitle = document.getElementById("wordOfTheDayWord")
const loadingWordOfTheDay = document.getElementById("smallLoading")

// Defines how many milliseconds are in a day
const MSinDaysAmount = 86400000

// Get the day number
Math.seedrandom(Math.floor(Date.now() / MSinDaysAmount))

// Displays today's word of the day
function displayWordOfTheDay() {
    
    // Gets the word of the day from the list
    const wordOfTheDay = words[Math.floor(Math.random() * words.length)]

    getWordInfo(wordOfTheDay).then((info)=>{

        // Sees if the word of the day exists in wiktionary
        if (info != -1) {
            
            // Removes loading square
            loadingWordOfTheDay.remove()

            // Sets the word of the day to the word of the day
            wordOfTheDayTitle.textContent = wordOfTheDay

            // Creates text that displays the type of the word
            const wordTypeText = document.createElement("p")
            wordTypeText.textContent = info.type
            wordOfTheDayHolder.appendChild(wordTypeText)
    
            // Creates text that displays the definition of the word
            const definitionText = document.createElement("p")
            definitionText.textContent = info.definition
            wordOfTheDayHolder.appendChild(definitionText)

            const wordOfTheDayURL = `${websiteDomain}word.html?w=${wordOfTheDay}`

            const wordOfTheDayLink = document.getElementById("wordOfTheDayLink")
            wordOfTheDayLink.href = wordOfTheDayURL
        }
        else {
            // If the word of the day doesn't exsist it run the word of the day again to get a new one
            displayWordOfTheDay()
        }
    })
}

displayWordOfTheDay()