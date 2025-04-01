
// Gathers the suggestions of the search boxes
function getSuggestions(searchQurery, start=0, end=10) {
    let wordSuggestions = [];

    wordSuggestions.push(searchQurery);

    for (const word of words) {
        if (word.startsWith(searchQurery) && word != searchQurery) {
            wordSuggestions.push(word);
        }
    }

    return wordSuggestions.splice(start, end);
}

// loads the html of the page from wiktionary
// RETURNS:
//      string: htmlContent of the website
//      -1: an error occured
async function getPage(word) {
    try {

        // Fetches the page through wiktionary
        const response = await fetch(`https://en.wiktionary.org/w/api.php?action=parse&page=${word}&format=json&prop=text&origin=*`);
        const data = await response.json();
        const htmlContent = data.parse.text['*'];

        // Creates a burner element to remove the class element effectivly
        const collectedWikiContent = document.createElement("div");
        collectedWikiContent.innerHTML = htmlContent;

        // Removes all unwanteded elements
        const classesToRemove = ["mw-editsection", "audiometa", "sister-wikipedia", "NavFrame", "request-box", 'mw-empty-elt', 'examples'];
        for (const classToRemove of classesToRemove) {
            while (collectedWikiContent.getElementsByClassName(classToRemove)[0]) {
                collectedWikiContent.getElementsByClassName(classToRemove)[0].remove();
            }
        }
        
        // Changes all the wiktionary links to local ones
        for (const link of collectedWikiContent.querySelectorAll("a")) {
            if (link.href.startsWith(websiteDomain.split("/")[0])) {
                link.href = `${wordURL}?w=${link.href.split("wiki/")[1]}`;
            } else {

                // Opens new tabs if the links can't be localized
                link.target = "_blank";
            }
        }
        
        // Returns the page recived
        return collectedWikiContent.innerHTML;
    } catch (error) {

        // Returns -1 as an error code
        return -1;
    }
}

// Initializes a list that contains all the types of words
const knownWordTypes = ["Adverb", "Pronoun", "Noun", "Verb", "Adjective", "Determiner", "Preposition", "Conjunction", "Interjection", "Symbol", "Letter", "Phrase", "Proper noun"];

// RETURNS:
//      Object{"type", "definition"}: A short description of the word
//      -1: an error occured
async function getWordInfo(word, defineInHTML = false, premadeHTML = undefined) {
    try {

        // Fetches the page through wiktionary
        const htmlContent = (premadeHTML)? premadeHTML: await getPage(word);
        
        // Defines the variables responsible to finding the word type of the inputted word
        let mostLikelyWordType = "Unknown";
        let wordTypePlace = -1;

        // Loops over the word types to find the most likely one
        for (const selectedWordType of knownWordTypes) {

            // Checks if the page includes the type, and is futher up the page than the best option
            if (htmlContent.includes(selectedWordType) && (htmlContent.indexOf(selectedWordType) < wordTypePlace || wordTypePlace == -1)) {
                mostLikelyWordType = selectedWordType;
                wordTypePlace = htmlContent.indexOf(selectedWordType);
            }
        }
        
        // Defines the variables responsible to finding the word's definition
        let definition = "";
        let parmsDepth = 0;

        const definitionLocation = htmlContent.split("<ol>")[1].split("</ol>")[0].split("<li>")[1].split("</li>")[0].split("<b>")[0];

        if (!defineInHTML)
        // Get the fist item of the first ordered list element because that is most likely to contain the word's definition
        for (const letter of definitionLocation) {

            // Sees if the text is inside the prams of an element so it doesn't get put in the definition
            if (letter == "<") {
                parmsDepth++;
            } else if (letter == ">") {
                parmsDepth--;
            }
            else if (parmsDepth == 0) {
                definition = `${definition}${letter}`;
            }
        }
        else definition = definitionLocation;

        // Returns the above information
        return {
            "type":mostLikelyWordType,
            "definition":definition
        };
    } catch (error) {

        // Returns -1 as an error code
        return -1;
    }
}

// Gets the amount of results that a search query produces
// RETURNS:
//      Number: amount of recived results
function getSearchResultAmount(searchQurery) {

    // Defines the counter of the result variable
    let resultAmount = 0;
    for (const word of words) {

        // Sees if the word is a possible result
        if (word.includes(searchQurery)) {

            // Increments the result amount variable to account of the result
            resultAmount ++;
        }
    }
    return resultAmount;
}

// Gets the search results, mainly used in the search page
function getSearchResults(searchQurery, start=0, end=10) {
    let results = [];

    // Converts the search qurery to lower case so it isn't case sensitive
    searchQurery = searchQurery.toLowerCase();

    // Loops through the word list to find all the results
    for (const word of words) {
        if (word.includes(searchQurery)) {
            
            // Sets a worth value to order the list
            let worth = 0;

            // Result gets the most worth because it's exacly the word they're looking for
            if (word == searchQurery) {
                worth = 100;
            } 
            
            // Result gets the second most worth because it completes what the user was searching for
            else if (word.startsWith(searchQurery)) {
                worth = 50;
            }

            // Adds the values to a list to sort later
            results.push({
                "value":word, 
                "worth":worth
            });
        }
    }

    // Sorts the list in decending order based on worth, putting the best results onto
    results = results.sort((a, b) => b.worth - a.worth );

    // Splitting the list up into the inputted values "start" and "end" to save memory
    results = results.slice(start, end);

    // Returns the sorted results list
    return results;
}