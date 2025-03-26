const websiteDomain = window.location.href.split("/").slice(0, -1).join("/") + "/"

// Grabs the conponents of the search bar
const searchInput = document.getElementById("searchInput")
const searchBox = document.getElementById("searchBox")
const searchBTN = document.getElementById("searchBTN")
const suggestionBox = document.getElementById("suggestionsBox")

// Define the variable in which indecates the suggestion selected by the user
let suggestionSelection = 0

const urlParamsInSearchBar = new URLSearchParams(window.location.search);
const foundQSearch = decodeURIComponent(urlParamsInSearchBar.get('q'));

// Checks if there is a q pram in the url bar so search in 
if (urlParamsInSearchBar.get('q')) {
    searchInput.value = foundQSearch
}

const homeBTN = document.getElementById("homeBTN")

if (homeBTN) {
    homeBTN.href = websiteDomain
}

// Updates the suggestion box with the new suggestion
function selectectSuggestion(suggestionID) {
    if (suggestionBox.firstChild) {

        // Remove the selected class to all the suggestions so they don't stay dark when not selected
        for (const suggestion of suggestionBox.children) {
            suggestion.classList.remove("selected")
        }

        // Adds the suggestion text to the search box
        searchInput.value = suggestionBox.children[suggestionID].textContent

        // Selected the suggestion that was selected
        suggestionBox.children[suggestionID].classList.add("selected")
    }
}

// Displays the suggestion container
function openSuggestions() {
    suggestionBox.style.display = ""
    searchBox.style.borderBottomLeftRadius = "0"
    searchBox.style.borderBottomRightRadius = "0"
}

// Removes the suggestion container
function closeSuggestions() {
    suggestionBox.style.display = "none"
    searchBox.style.borderBottomLeftRadius = ""
    searchBox.style.borderBottomRightRadius = ""
}

// Runs the search engine when the search icon is clicked
searchBTN.addEventListener("click", ()=>{
    search(searchInput.value)
})

let isMouseDown = false

document.addEventListener("mousedown", ()=>{
    isMouseDown = true
})

document.addEventListener("mouseup", ()=>{
    isMouseDown = false
})

// Runs when the user types in the search input
searchInput.addEventListener("input", ()=>{

    // Sees if there are any non space charactors in the string
    if (searchInput.value.replace(" ", "") != ""){

        // Selects the first suggestion (Which is the user's input)
        suggestionSelection = 0

        // Displays the suggestion box
        openSuggestions()

        // Removes all the previously added suggestions
        while (suggestionBox.firstChild) {
            suggestionBox.firstChild.remove()
        }

        // Gets the suggestionss
        const searchSuggestions = getSuggestions(searchInput.value)

        if (searchSuggestions.length > 0) {
            let suggestionIndex = 0;
            for (const suggestion of searchSuggestions) {

                // Keeps the current suggestion index into a constant to keep the value for listeners
                const currentSuggestionIndex = suggestionIndex

                // Creates the suggestion
                const suggestionTile = document.createElement("div")

                // Adds the text to the suggestion
                suggestionTile.textContent = suggestion

                // Adds the styles of the suggestion class to the suggestion
                suggestionTile.classList.add("suggestion")
                suggestionBox.appendChild(suggestionTile)

                // Sees if the mouse is hovering over the suggestion and mouse is down to select the suggestion
                suggestionTile.addEventListener("mouseenter", ()=>{
                    if (isMouseDown) {
                        suggestionSelection = currentSuggestionIndex
                        selectectSuggestion(suggestionSelection)
                    }
                }) 

                // Clicks the suggestion if the mouse is on the suggestion and is raised
                suggestionTile.addEventListener("mouseup", ()=>{
                    search(suggestionTile.textContent)
                })

                // Increments the index
                suggestionIndex ++
            }
        }

        // Selects the fist suggestion (Which is the user's input)
        suggestionBox.firstChild.classList.add("selected")

    } else {

        // Hides all the suggestions when nothing's there
        closeSuggestions()
    }
})

// Initilizes the site that the user can goto from the search bar
const searchURL = `${websiteDomain}search.html`
const wordURL = `${websiteDomain}word.html`

// Runs the search engine by going to the search page
function search(qurery) {
    if (suggestionSelection) window.location.href = `${wordURL}?q=${encodeURIComponent(qurery)}&w=${encodeURIComponent(qurery)}`
    else if (qurery) window.location.href = `${searchURL}?q=${encodeURIComponent(qurery)}`
}

// Doesn't run the event listener that run when you unfocus the search input when clicking on the suggestions so they don't dissappear before you click them
suggestionBox.addEventListener('mousedown', (event) => {
    event.preventDefault();
})

// Displays the suggestions if there are some on the search box focus
searchInput.addEventListener("focus", ()=>{
    if (suggestionBox.firstChild) {
        openSuggestions()
    }
}) 

// Hide the suggestion box when the search input gets un focused
searchInput.addEventListener("blur", ()=>{
    closeSuggestions()
}) 

// Adds actions to the search bar
searchInput.addEventListener("keydown", (event)=>{

    // Goes down the suggestion list if they press the down arrow
    if (event.key == "ArrowDown") {
        suggestionSelection = (suggestionSelection + 1) % suggestionBox.children.length
        event.preventDefault()
        selectectSuggestion(suggestionSelection)
    } 

    // Goes up the suggestion list if they press the up arrow
    else if (event.key == "ArrowUp") {
        suggestionSelection = (suggestionSelection - 1) % suggestionBox.children.length
        if (suggestionSelection < 0) {
            suggestionSelection = suggestionBox.children.length - 1
        }
        
        event.preventDefault()
        selectectSuggestion(suggestionSelection)

    // Searches run the search engine if they press enter
    } else if (event.key == "Enter") {
        search(searchInput.value)
    }
})