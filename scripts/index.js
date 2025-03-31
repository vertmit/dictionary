const animatedBgCanvas = document.getElementById("animatedBg")
animatedBgCanvas.width = window.innerWidth
animatedBgCanvas.height = window.innerHeight

const context = animatedBgCanvas.getContext("2d")

let mouseX = -1;
let mouseY = -1;

let pressOriginX = 0;
let pressOriginY = 0;
let dragging = false;

window.addEventListener("mousemove", (event)=>{
    mouseX = event.clientX
    mouseY = event.clientY
})

let connections = []
const amountOfConnections = 750 * ((window.innerWidth * window.innerHeight) / (1920 * 1080))

const distanceNeededToConnectWithCursor = 100
const distanceNeededFormCursorToExpand = 10
const expandedSize = 6
const distanceNeededToConnectWithConnection = 75

const connectionBorderWidthPX = 2

const lineStrength = 0.5

const lineWidth = 3

const connectionColour = {
    "r": 44,
    "g": 62,
    "b": 97
}
const connectionSize = 3;

let takenWords = []

for (let i = 0; i < amountOfConnections; i++) {
    let connectionWord = words[Math.floor(Math.random() * words.length)]
    while (takenWords.includes(connectionWord)) {
        connectionWord = words[Math.floor(Math.random() * words.length)]
    }
    takenWords.push(connectionWord)

    connections.push({
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
        "word":connectionWord
    })
}

let animationPressed = false
let animationPressedBackUp = false
let animationUnpressed = false

let pressedConnection = -1

window.addEventListener("mousedown", ()=>{
    animationPressed = true
    animationPressedBackUp = true
    dragging = false
    
    pressOriginX = mouseX;
    pressOriginY = mouseY
    for (let connection of connections) {
        if (Math.sqrt(Math.pow(connection.displayX - mouseX, 2) + Math.pow(connection.displayY - mouseY, 2)) < connection.size) {
            pressedConnection = connection.id
            break
        }
    }
})

window.addEventListener("mouseup", ()=>{
    animationPressed = false
})

function animateBg() {
    context.clearRect(0, 0, animatedBgCanvas.width, animatedBgCanvas.height);
    document.body.style.cursor = "";
    document.body.style.userSelect = ""

    let connectionClicked = false

    if (animationPressedBackUp && !animationPressed) {
        animationUnpressed = true
        animationPressedBackUp = false
    }

    if (dragging  && animationPressed) {
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none"
    }

    for (let connection of connections) {
        const displayPositionX = connection.centerX + Math.sin(connection.animationFrame * connection.animationXSpeed) * connection.animationXSignificance;
        const displayPositionY = connection.centerY + Math.cos(connection.animationFrame * connection.animationYSpeed) * connection.animationYSignificance;

        connection.displayX = displayPositionX;
        connection.displayY = displayPositionY;

        let currentConnectionSize = connectionSize;

        if (dragging && pressedConnection == connection.id) {
            currentConnectionSize = expandedSize
            connection.animationFrame -= connection.overallAnimationSpeed;
        }

        
        if ((mouseX != pressOriginX || mouseY != pressOriginY) && animationPressed && pressedConnection == connection.id) {
            dragging = true

            connection.centerX +=  mouseX - pressOriginX;
            connection.centerY +=  mouseY - pressOriginY;

            pressOriginX = mouseX
            pressOriginY = mouseY
        }

        else if (mouseX != -1 && mouseY != -1 &&
            mouseX > displayPositionX - distanceNeededToConnectWithCursor &&
            mouseX < displayPositionX + distanceNeededToConnectWithCursor &&
            mouseY > displayPositionY - distanceNeededToConnectWithCursor &&
            mouseY < displayPositionY + distanceNeededToConnectWithCursor) {

            const distanceToCursor = Math.sqrt(
                Math.pow(displayPositionX - mouseX, 2) + Math.pow(displayPositionY - mouseY, 2)
            );

            if (distanceToCursor < distanceNeededToConnectWithCursor) {

                context.beginPath();
                context.moveTo(displayPositionX, displayPositionY);
                context.lineTo(mouseX, mouseY);
                context.strokeStyle = `rgba(${connectionColour.r}, ${connectionColour.g}, ${connectionColour.b}, ${(1 - distanceToCursor / distanceNeededToConnectWithCursor) * lineStrength})`;
                context.lineWidth = lineWidth;
                context.stroke();

                

                if (distanceToCursor <= distanceNeededFormCursorToExpand && !dragging) {
                    
                    currentConnectionSize = Math.max(
                        Math.min(((1-distanceToCursor / expandedSize) + (expandedSize / distanceNeededFormCursorToExpand)) * expandedSize, expandedSize),
                        connectionSize
                    );
                    
                    if (distanceToCursor <= Math.ceil(currentConnectionSize)) {
                        
                        if (document.body.style.cursor == "") document.body.style.cursor = "pointer";
                        connection.animationFrame -= connection.overallAnimationSpeed;                    
                        console.log(animationUnpressed, !connectionClicked, connection.id == pressedConnection)
                        if (animationUnpressed && !connectionClicked && connection.id == pressedConnection) {
                            
                            const wordHolder = document.createElement("a")
                            wordHolder.href = `${wordURL}?w=${connection.word}`
                            wordHolder.style.opacity = 0
                            wordHolder.classList = "connectionWordHolder"
                            const word = document.createElement("h1")
                            word.textContent = connection.word

                            wordHolder.appendChild(word)

                            document.body.appendChild(wordHolder)
                            wordHolder.style.left = `${Math.min(Math.max(displayPositionX - wordHolder.offsetWidth/2, connectionBorderWidthPX), window.innerWidth - wordHolder.offsetWidth - connectionBorderWidthPX)}px`
                            wordHolder.style.top = `${Math.min(Math.max(displayPositionY - wordHolder.offsetHeight/2, connectionBorderWidthPX), window.innerHeight - wordHolder.offsetHeight - connectionBorderWidthPX)}px`
                            wordHolder.style.opacity = 1
                            
                            connectionClicked = true
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

        context.beginPath();
        context.arc(displayPositionX, displayPositionY, currentConnectionSize, 0, 2 * Math.PI);
        context.fillStyle = `rgb(${connectionColour.r}, ${connectionColour.g}, ${connectionColour.b})`;
        context.fill();

        connection.size = currentConnectionSize

        connection.animationFrame += connection.overallAnimationSpeed;
    }

    if (!animationPressed) {
        pressedConnection = -1
        dragging = false
    }
    
    for (let connection1 of connections) { 
        for (let connection2 of connections) { 
            if (connection1.id > connection2.id && connection2.displayX > connection1.displayX-distanceNeededToConnectWithConnection && connection2.displayY < connection1.displayY+distanceNeededToConnectWithConnection && connection2.displayY > connection1.displayY-distanceNeededToConnectWithConnection && connection2.displayY < connection1.displayY+distanceNeededToConnectWithConnection) {
                const distanceBetweenPoints = Math.sqrt(Math.pow(connection1.displayX-connection2.displayX, 2)+Math.pow(connection1.displayY-connection2.displayY, 2))
                if (distanceBetweenPoints < distanceNeededToConnectWithConnection) {
                    context.beginPath()
                    context.moveTo(connection1.displayX, connection1.displayY)
                    context.lineTo(connection2.displayX, connection2.displayY)
                    context.strokeStyle = `rgba(${connectionColour.r}, ${connectionColour.g}, ${connectionColour.b}, ${(1-distanceBetweenPoints/distanceNeededToConnectWithConnection)*lineStrength})`;
                    context.lineWidth = lineWidth
                    context.stroke()
                }
            }
        }
    }

    animationUnpressed = false

    window.requestAnimationFrame(animateBg);
}

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

            const wordOfTheDayURL = `${wordURL}?w=${wordOfTheDay}`

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

