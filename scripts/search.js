// Gets the place in which the results should be placed
const searchResultsHolder = document.getElementById("searchResultsHolder")


// Gets the search query from the url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const qsearch = urlParams.get('q');

// Gets the time of running to time the program
const startTime = Date.now()

// defines where the results start and how many result get displayed after every iteration
const resultsInPage = 30

// Gets the page number
const psearch = urlParams.get('p');
let pageId = 0;

// Sees if the url has a page id, if not then it defults to 0
if (psearch) pageId = Number(psearch)

document.title = `DE Search - ${qsearch}`

// Loads the results
function loadSearchResults(word, amountOfResults, pageNumber) {

    // Get the results within the loading range
    const results = getSearchResults(word, amountOfResults*pageNumber, amountOfResults*pageNumber+amountOfResults)

    // Iterates through the results to display each of them
    for (const result of results) {

        // Gets elements that are in the search result
        const resultUrl = document.createElement("a")
        const resultHolder = document.createElement("div")
        const resultTitle = document.createElement("h1")

        resultHolder.classList = "result resultLoading"

        // Sets the reult to the correct word
        resultTitle.textContent = result.value

        resultHolder.appendChild(resultTitle)
        resultUrl.appendChild(resultHolder)

        // Defines the url that the user get directed to when clicking the result
        const wordUrl = `${wordURL}?q=${encodeURIComponent(word)}&w=${encodeURIComponent(result.value)}`
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

                resultHolder.classList.remove("resultLoading")
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
        window.location.href = `${wordURL}?q=${encodeURIComponent(qsearch)}&w=${encodeURIComponent(getSearchResults(qsearch, 0, 1)[0].value)}`
    } 

    // sees if no results can be loaded with the query
    else if (checkSeachResultLength == 0) {

        // Displays an error that there arn't any results
        document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
        document.getElementById("loadingText").textContent = "No Results Found"
    } 
    else {

        // Removes all the loading elements
        searchResultsHolder.innerHTML = ""

        if (pageId == 0 ) {
            const infoText = document.createElement("p")

            // Displays how long it took to get how many results can be loaded
            infoText.textContent = `Found ${getSearchResultAmount(qsearch).toLocaleString()} Unfiltered Results for '${qsearch}' in ${Date.now() - startTime} ms`
            infoText.classList = "infoText"
            infoText.style.marginLeft = "10px"
            searchResultsHolder.appendChild(infoText)
        }
    
        // Loades the initial search results on run
        // Runs until the results fill the height of the screen
        loadSearchResults(qsearch, resultsInPage, pageId)

        // 
        // Page Selector
        // -----
        const pageSelectorHolder = document.createElement("div")
        pageSelectorHolder.id = "pageSelectorHolder"

        // Defines how may page buttons can be shown at one
        const pageSelectorAmount = 10

        // Gets how many pages there are
        const amountOfPages = Math.floor(checkSeachResultLength/resultsInPage)

        // Sees if there isn't only one page
        if (amountOfPages > 1){

            // Gets the first page number to be shown
            const pageSelectorStart = (pageId - Math.floor(pageSelectorAmount / 2) < 0)? 0 : (pageId - Math.floor(pageSelectorAmount / 2) > amountOfPages - pageSelectorAmount)? amountOfPages - pageSelectorAmount: pageId - Math.floor(pageSelectorAmount / 2)

            // Loops through all the page numbers to display them
            for (let page = pageSelectorStart; page < Math.min(pageSelectorStart + pageSelectorAmount, amountOfPages) + 1; page++) { 
                const pageBTN = document.createElement("a");

                // Displays one more than the accual page number because it uses 0 indexing
                pageBTN.textContent = page + 1

                // Gets the URL of the page the button leads to
                pageBTN.href = `${searchURL}?q=${encodeURIComponent(qsearch)}&p=${page}`
                pageBTN.classList.add("pageBTN")

                // Sees if the page button leads to the current page
                if (page == pageId) {

                    // Sets the page number to selected
                    pageBTN.classList.add("selected")
                }

                // Adds the button to the button holder
                pageSelectorHolder.appendChild(pageBTN)
            }

            // Adds the button holder to the bottom of the page
            searchResultsHolder.appendChild(pageSelectorHolder)
        }
    }
} 
else {
    
    // Displays an error message if there isn't a q pram in the url
    document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
    document.getElementById("loadingText").textContent = "No Query Inputted"
}