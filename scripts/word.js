const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const wsearch = decodeURIComponent(urlParams.get('w'));

const pageContentHolder = document.getElementById("pageContent")

document.title = `DE Word - ${wsearch}`

if (urlParams.get('w')) {
    
    getPage(wsearch).then(pageContent => {
        if (pageContent == -1) {
            document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
            document.getElementById("loadingText").textContent = "loading Failed"
        } else {

            pageContentHolder.innerHTML = ""
            const topInforamtion = document.createElement("div")
            topInforamtion.id = "topInfo"
            const wordTitle = document.createElement("div")
            const wordTitleText = document.createElement("h1")

            wordTitle.id = "titleHolder"
            wordTitleText.textContent = wsearch

            topInforamtion.appendChild(wordTitle)
            wordTitle.appendChild(wordTitleText)

            pageContentHolder.appendChild(topInforamtion)

            getWordInfo(wsearch, true).then((info)=>{
                const wordType = document.createElement("p")
                wordType.textContent = info.type
                topInforamtion.appendChild(wordType)

                const definition = document.createElement("p")
                definition.innerHTML = info.definition
                topInforamtion.appendChild(definition)
            })

            const collectedWikiContent = document.createElement("div");
            collectedWikiContent.innerHTML = pageContent

            const classesToRemove = ["mw-editsection", "audiometa", "sister-wikipedia", "NavFrame", "request-box"]

            for (const classToRemove of classesToRemove) {
                while (collectedWikiContent.getElementsByClassName(classToRemove)[0]) {
                    collectedWikiContent.getElementsByClassName(classToRemove)[0].remove()
                }
            }
            
            for (const link of collectedWikiContent.querySelectorAll("a")) {
                if (link.href.startsWith(websiteDomain.split("/")[0])) {
                    
                    link.href = `${wordURL}?w=${link.href.split("wiki/")[1]}`
                } else {
                    link.target = "_blank"
                }
            }

            pageContentHolder.appendChild(collectedWikiContent)

            const audio = document.querySelectorAll("audio")

            if (audio.length > 0) {
                const titleAudio = audio[0].cloneNode(true)
                wordTitle.appendChild(titleAudio)
            }


        }
    })
} else {
    document.getElementById("loading").style.animation = "failedLoading 500ms forwards"
    document.getElementById("loadingText").textContent = "loading Failed"
}