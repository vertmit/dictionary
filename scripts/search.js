// Gets the place in which the results should be placed
const searchResultsHolder = document.getElementById("searchResultsHolder")

// Gets the search query from the url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const qsearch = urlParams.get('q');

// Gets the time of running to time the program
const startTime = Date.now()

// defines where the results start and how many result get displayed after every iteration
let bottomResult = 0
let resultInterval = 10

document.title = `DE Search - ${qsearch}`

// Loads the results
function loadSearchResults(word, start, end) {
    console.log(start, end)
    // Get the results within the loading range
    const results = getSearchResults(word, start, end)

    // Iterates through the results to display each of them
    for (const result of results) {

        // Gets elements that are in the search result
        const resultUrl = document.createElement("a")
        const resultHolder = document.createElement("div")
        const resultTitle = document.createElement("h1")

        resultHolder.classList = "result"

        // Sets the reult to the correct word
        resultTitle.textContent = result.value

        resultHolder.appendChild(resultTitle)
        resultUrl.appendChild(resultHolder)

        // Defines the url that the user get directed to when clicking the result
        const wordUrl = `word?q=${encodeURIComponent(word)}&w=${encodeURIComponent(result.value)}`
        resultUrl.href = wordUrl

        // Defines the size of the loading square used for loading other information about the word
        const loadingSquareSize = "30px"

        // Adds a loading square for the other result content
        const loadingContent = document.createElement("div")
        loadingContent.classList = "smallLoading"
        loadingContent.style.animation = "rotatingNonCentred 1s infinite"
        loadingContent.style.width = loadingSquareSize
        loadingContent.style.height = loadingSquareSize
        searchResultsHolder.appendChild(resultUrl)
        resultHolder.appendChild(loadingContent)

        // Gets the other information about the word
        getWordInfo(result.value).then((info)=>{

            // Sees if wiktionary has the wanted word
            if (info != -1) {

                // removes the loading square
                loadingContent.remove()

                // Adds the word type to the result
                const typeIndetifyer = document.createElement("p")
                typeIndetifyer.textContent = info.type
                resultHolder.appendChild(typeIndetifyer)

                // Adds one of the word's definition to the result
                const wordDefinition = document.createElement("p")
                wordDefinition.textContent = info.definition
                resultHolder.appendChild(wordDefinition)
            } else {

                // Deletest the result if the word doesn't exsist
                resultHolder.remove()
            }
        })
    }

    // Returns how many results got displayed
    return results.length;
}

if (qsearch) {

    // Gets the amount of results
    const checkSeachResultLength = getSearchResultAmount(qsearch)

    // Sees if there is only one result
    if (checkSeachResultLength == 1) {

        // Goes to the page of the only reult
        window.location.href = `word?q=${encodeURIComponent(qsearch)}&w=${encodeURIComponent(getSearchResults(qsearch, 0, 1)[0].value)}`
    } 

    // sees if no results can be loaded with the query
    else if (checkSeachResultLength == 0) {

        // Displays an error that there arn't any results
        document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
        document.getElementById("loadingText").textContent = "No Results Found"
    } 
    else {
        // Removes the loading screen
        searchResultsHolder.innerHTML = ""
        const infoText = document.createElement("p")

        // Displays how long it took to get how many results can be loaded
        infoText.textContent = `Found ${getSearchResultAmount(qsearch).toLocaleString()} Unfiltered Results for '${qsearch}' in ${Date.now() - startTime} ms`
        infoText.classList = "infoText"
        infoText.style.marginLeft = "10px"
        searchResultsHolder.appendChild(infoText)
    
        // Loades the initial search results on run
        // Runs until the results fill the height of the screen
        while (searchResultsHolder.scrollHeight < window.innerHeight) {

            // Checkes if results have loaded so there is an exit out of the loop if there isn't enough results to fill the screen
            if (loadSearchResults(qsearch, bottomResult, bottomResult + resultInterval) == 0) {
                break
            }
            bottomResult += resultInterval
        }
        
        // Sees if the user has scrolled enough to reach the bottom to load results
        window.addEventListener("scroll", ()=>{
            if (window.scrollY + window.innerHeight + 20 > searchResultsHolder.offsetHeight) {
                loadSearchResults(qsearch, bottomResult, bottomResult+resultInterval)
                bottomResult += resultInterval
            }
            
        })
    }
} 
else {
    // Displays an error message if there isn't a q pram in the url
    document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
    document.getElementById("loadingText").textContent = "No Query Inputted"
}