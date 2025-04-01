// Gets the word from the url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const wsearch = decodeURIComponent(urlParams.get('w'));

// Gets the element where the page is placed
const pageContentHolder = document.getElementById("pageContent")

// Sets the title to the word
document.title = `DE Word - ${wsearch}`

// Sees if a word was inputted
if (urlParams.get('w')) {
    getPage(wsearch).then(pageContent => {
        // Displays an error if something errors
        if (pageContent == -1) {
            document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
            document.getElementById("loadingText").textContent = "loading Failed"
        } 
        
        // Displays the page
        else {
            // Removes everything from the page
            pageContentHolder.innerHTML = ""

            // Adds a quick look at the top of the page
            const topInforamtion = document.createElement("div")
            topInforamtion.id = "topInfo"

            // Create the elements for the top info's title
            const wordTitle = document.createElement("div")
            const wordTitleText = document.createElement("h1")
            wordTitle.id = "titleHolder"

            // Sets the title's text
            wordTitleText.textContent = wsearch

            // Adds elements to the screen
            topInforamtion.appendChild(wordTitle)
            wordTitle.appendChild(wordTitleText)
            pageContentHolder.appendChild(topInforamtion)

            // Gets the word's info for quick access
            getWordInfo(wsearch, true, pageContent).then((info)=>{

                // Adds quick acces information to the top
                const wordType = document.createElement("p")
                wordType.textContent = info.type
                topInforamtion.appendChild(wordType)

                const definition = document.createElement("p")
                definition.innerHTML = info.definition
                topInforamtion.appendChild(definition)
            })

            // Puts all the collect html into a div
            const collectedWikiContent = document.createElement("div");
            collectedWikiContent.innerHTML = pageContent

            // Displays the collected html on the screen
            pageContentHolder.appendChild(collectedWikiContent)

            // Adds the first audio clip to the top
            const audio = document.querySelectorAll("audio")
            if (audio.length > 0) {
                const titleAudio = audio[0].cloneNode(true)
                wordTitle.appendChild(titleAudio)
            }
        }
    })
} else {

    // Shows that the plage failed to load
    document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
    document.getElementById("loadingText").textContent = "loading Failed"
}