// Gathers the canvas element
const animatedBgCanvas = document.getElementById("animatedBg")

// Sets the width and the height of the canvas to fill the screen
animatedBgCanvas.width = window.innerWidth
animatedBgCanvas.height = window.innerHeight

// Creates the context of the canvas to draw elements
const context = animatedBgCanvas.getContext("2d")

// Initalizes the mouse coords, -1 being undefined
let mouseX = -1;
let mouseY = -1;

let pressOriginX = 0;
let pressOriginY = 0;
let dragging = false;

// Updates the mouse coords when it moves
window.addEventListener("mousemove", (event)=>{
    mouseX = event.clientX
    mouseY = event.clientY
})

// Defines all the node variables
let nodes = []

// Sets the amount of nodes on screen
const amountOfNodes = 750 * ((window.innerWidth * window.innerHeight) / (1920 * 1080))

// Sets the display properties of the nodes and the lines connecting them
const distanceNeededToConnectWithCursor = 100
const distanceNeededFormCursorToExpand = 10
const expandedSize = 6
const distanceNeededToConnectWithNode = 75
const nodeBorderWidthPX = 2
const lineStrength = 0.5
const lineWidth = 3
const nodeSize = 3;

// Sets the colour of the nodes and the lines
const nodeColour = {
    "r": 44,
    "g": 62,
    "b": 97
}

// Insializes the taken words variable to make sure no 2 nodes have the same word
let takenWords = []

// Creates all the nodes
for (let i = 0; i < amountOfNodes; i++) {

    // Gets a unique word
    let nodeWord = words[Math.floor(Math.random() * words.length)]
    while (takenWords.includes(nodeWord)) {
        nodeWord = words[Math.floor(Math.random() * words.length)]
    }
    takenWords.push(nodeWord)

    nodes.push({
        "centerX":Math.random()*window.innerWidth,
        "centerY":Math.random()*window.innerHeight,
        "displayX":0,
        "displayY":0,
        "animationFrame":Math.random()*2 * Math.PI,
        "animationYSignificance":Math.random()*10 + 10,
        "animationXSignificance":Math.random()*10 + 10,
        "animationXSpeed":Math.random()*0.3 + 0.5,
        "animationYSpeed":Math.random()*0.3 + 0.5,
        "overallAnimationSpeed":Math.random()*0.005 + 0.01,
        "size": 0,
        "id":i,
        "word":nodeWord
    })
}

// Initilizes the types of presses
let animationPressed = false
let animationPressedBackUp = false
let animationUnpressed = false

let pressedNode = -1

// Events when the mouse is down
window.addEventListener("mousedown", ()=>{

    // Sets all the mouse presses to true
    animationPressed = true
    animationPressedBackUp = true

    // Disables dragging
    dragging = false
    
    // Set the orgin presses to the current mouse pos
    pressOriginX = mouseX;
    pressOriginY = mouseY

    // Sees what node is being pressed
    for (let node of nodes) {
        if (Math.sqrt(Math.pow(node.displayX - mouseX, 2) + Math.pow(node.displayY - mouseY, 2)) < node.size) {
            pressedNode = node.id
            break
        }
    }
})

// Events in mouse up
window.addEventListener("mouseup", ()=>{
    animationPressed = false
})

// Background expore animation
function animateBg() {

    // clears the screen
    context.clearRect(0, 0, animatedBgCanvas.width, animatedBgCanvas.height);
    document.body.style.cursor = "";
    document.body.style.userSelect = ""

    // Defines variable that sees if a node is has been clicked to ensure only one word popup is shown at one time
    let nodeClicked = false

    // Sees if the mouse has only just gotten unpressed
    if (animationPressedBackUp && !animationPressed) {
        animationUnpressed = true
        animationPressedBackUp = false
    }

    // Changes the mouse to grabbing when the variable "grabbing" is true
    if (dragging  && animationPressed) {
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none"
    }

    // Animates nodes
    for (let node of nodes) {

        // Get the position in which the node will be displayed
        const displayPositionX = node.centerX + Math.sin(node.animationFrame * node.animationXSpeed) * node.animationXSignificance;
        const displayPositionY = node.centerY + Math.cos(node.animationFrame * node.animationYSpeed) * node.animationYSignificance;
        node.displayX = displayPositionX;
        node.displayY = displayPositionY;

        // Sets the node size so it can be changed on hover
        let currentNodeSize = nodeSize;

        // Dragging looks
        if (dragging && pressedNode == node.id) {

            // Sets the node to have the max size
            currentNodeSize = expandedSize

            // Delays animation
            node.animationFrame -= node.overallAnimationSpeed;
        }

        // Sees if the mouse have moved since its last mouse press, and the mouse is down to start dragging
        if ((mouseX != pressOriginX || mouseY != pressOriginY) && animationPressed && pressedNode == node.id) {

            // Starts dragging
            dragging = true

            // Moves the node to the mouse pos
            node.centerX +=  mouseX - pressOriginX;
            node.centerY +=  mouseY - pressOriginY;

            // Sets the oraiin to the current mouse position
            pressOriginX = mouseX
            pressOriginY = mouseY
        }

        // Sets a bounding box to optimize performance
        else if (mouseX != -1 && mouseY != -1 &&
            mouseX > displayPositionX - distanceNeededToConnectWithCursor &&
            mouseX < displayPositionX + distanceNeededToConnectWithCursor &&
            mouseY > displayPositionY - distanceNeededToConnectWithCursor &&
            mouseY < displayPositionY + distanceNeededToConnectWithCursor) {

            // Gets the distance of the mouse to the node
            const distanceToCursor = Math.sqrt(
                Math.pow(displayPositionX - mouseX, 2) + Math.pow(displayPositionY - mouseY, 2)
            );

            // Sees if the mouse is close anough to create a line
            if (distanceToCursor < distanceNeededToConnectWithCursor) {
                
                // Draws the line
                context.beginPath();
                context.moveTo(displayPositionX, displayPositionY);
                context.lineTo(mouseX, mouseY);

                // Sets the colour of the line to the selected colour and the opacity to the persentage of mouse distance to max distance
                context.strokeStyle = `rgba(${nodeColour.r}, ${nodeColour.g}, ${nodeColour.b}, ${(1 - distanceToCursor / distanceNeededToConnectWithCursor) * lineStrength})`;
                context.lineWidth = lineWidth;

                // Strokes the line
                context.stroke();

                if (distanceToCursor <= distanceNeededFormCursorToExpand && !dragging) {
                    
                    // Gets the new size of the node
                    currentNodeSize = Math.max(
                        Math.min(((1-distanceToCursor / expandedSize) + (expandedSize / distanceNeededFormCursorToExpand)) * expandedSize, expandedSize),
                        nodeSize
                    );
                    
                    // Sees if the mouse is close enough to click it
                    if (distanceToCursor <= Math.ceil(currentNodeSize)) {
                        
                        // Set the cursor to pointer to show that the node can be clicked
                        if (document.body.style.cursor == "") document.body.style.cursor = "pointer";

                        // Delays the animation
                        node.animationFrame -= node.overallAnimationSpeed;     

                        // Sees if the node hase been clicked
                        if (animationUnpressed && !nodeClicked && node.id == pressedNode) {
                            
                            // Creates the element to hold the word inside the node
                            const wordHolder = document.createElement("a")

                            // Sets the url of the word
                            wordHolder.href = `${wordURL}?w=${node.word}`

                            // Sets the opacity to 0 for animation
                            wordHolder.style.opacity = 0
                            wordHolder.classList = "nodeWordHolder"

                            // Creates element to hold the word
                            const word = document.createElement("h1")
                            word.textContent = node.word

                            // Adds the word to the word holder
                            wordHolder.appendChild(word)

                            // Displays the word to the user
                            document.body.appendChild(wordHolder)

                            // Sets the position of the word popup
                            wordHolder.style.left = `${Math.min(Math.max(displayPositionX - wordHolder.offsetWidth/2, nodeBorderWidthPX), window.innerWidth - wordHolder.offsetWidth - nodeBorderWidthPX)}px`
                            wordHolder.style.top = `${Math.min(Math.max(displayPositionY - wordHolder.offsetHeight/2, nodeBorderWidthPX), window.innerHeight - wordHolder.offsetHeight - nodeBorderWidthPX)}px`
                            wordHolder.style.opacity = 1
                            
                            // Ensures only one node is clicked
                            nodeClicked = true

                            // Hides the word with an animation
                            wordHolder.addEventListener("mouseleave", ()=>{
                                wordHolder.style.opacity = 0
                                setTimeout(()=>{
                                    wordHolder.remove()
                                }, 100)
                            })
                        }
                    }
                }
            }
        }

        // Draws the node
        context.beginPath();
        context.arc(displayPositionX, displayPositionY, currentNodeSize, 0, 2 * Math.PI);
        context.fillStyle = `rgb(${nodeColour.r}, ${nodeColour.g}, ${nodeColour.b})`;
        context.fill();

        // Sets the node's size to the node's size
        node.size = currentNodeSize

        // Increments the node's animation
        node.animationFrame += node.overallAnimationSpeed;
    }

    // Sees if the animaition isn't being pressed to disable dragging
    if (!animationPressed) {
        pressedNode = -1
        dragging = false
    }
    
    // Creates lines to each node within eachother's range
    for (let node1 of nodes) { 
        for (let node2 of nodes) { 

            // Ensures the nodes to double connect to eachother and are in eachother's bounding box
            if (node1.id > node2.id && node2.displayX > node1.displayX-distanceNeededToConnectWithNode && node2.displayY < node1.displayY+distanceNeededToConnectWithNode && node2.displayY > node1.displayY-distanceNeededToConnectWithNode && node2.displayY < node1.displayY+distanceNeededToConnectWithNode) {
                
                // Gets the distance between each node
                const distanceBetweenPoints = Math.sqrt(Math.pow(node1.displayX-node2.displayX, 2)+Math.pow(node1.displayY-node2.displayY, 2))
                
                // Sees if the distance is small enough to create a line
                if (distanceBetweenPoints < distanceNeededToConnectWithNode) {

                    // Draws a line between the two nodes
                    context.beginPath()
                    context.moveTo(node1.displayX, node1.displayY)
                    context.lineTo(node2.displayX, node2.displayY)

                    // Sets the colour of the line to the selected colour and the opacity to the persentage of mouse distance to max distance
                    context.strokeStyle = `rgba(${nodeColour.r}, ${nodeColour.g}, ${nodeColour.b}, ${(1-distanceBetweenPoints/distanceNeededToConnectWithNode)*lineStrength})`;
                    
                    // Sets the line width to the selected width
                    context.lineWidth = lineWidth

                    // Strokes the line
                    context.stroke()
                }
            }
        }
    }

    // Sets the unpressed to false so its only true for one frame
    animationUnpressed = false

    // Keeps the animation running
    window.requestAnimationFrame(animateBg);
}

// Runs the animation
window.requestAnimationFrame(animateBg)

// 
// Word Of The Day
// ---------

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

        // Sets the url of the word of the day
        const wordOfTheDayURL = `${wordURL}?w=${wordOfTheDay}`

        const wordOfTheDayLink = document.getElementById("wordOfTheDayLink")
        wordOfTheDayLink.href = wordOfTheDayURL

    })
}

// Displays the word of the day
displayWordOfTheDay()