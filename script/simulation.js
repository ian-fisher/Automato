// Elements
const resultWordElement = document.getElementById("inputWordResultWord");
const resultAcceptedElement = document.getElementById("inputWordResultAccepted");
const resultExceptionElement = document.getElementById("inputWordResultException");

const nextStepButton = document.getElementById("nextStepButton");
const inputWordElement = document.getElementById("inputWord");


// Runs simulation of the acceptor on the input word, step by step
runSimulation = function (event) {
    // Prevent page reload
    event.preventDefault();

    // Get input word
    const inputWord = inputWordElement.value;
    console.log("Running step-by-step simulation for input word:", inputWord);
    resetResult(inputWord);
    nextStepButton.disabled = false;

    // Start simulation step-by-step
    startSBSSimulation(inputWord);
}

// displays input word; clears accepted, rejection
function resetResult(inputWord) {
    resultWordElement.textContent = inputWord;
    resultAcceptedElement.textContent = "";
    resultExceptionElement.textContent = "";
}

// Goes to the next step of the simulation
nextStep = function (event) {
    // Prevent page reload
    event.preventDefault();

    // Run next step in simulation
    const result = nextNodeSBS();

    if ('accepted' in result) {
        if (result.accepted) {
            simulationAccepted()
        }
        else {
            var details = result.exception ? result.exception : "";
            simulationRejected(details);
        }
    }
}

// simulation over, accepted
function simulationAccepted() {
    showBadgeAccepted();
    simulationEnd();
}

// simulation over, rejected
function simulationRejected(details) {
    showBadgeRejected();
    showBadgeDetails(details);
    simulationEnd();
}

// simulation over
function simulationEnd() {
    nextStepButton.disabled = true;
}

// UI badges

// badge for result: accepted
function showBadgeAccepted() {
    resultAcceptedElement.classList.remove(...resultAcceptedElement.classList);
    resultAcceptedElement.classList.add("badge");
    resultAcceptedElement.classList.add("badge-success");
    resultAcceptedElement.textContent = "accepted";
}

// badge for result: rejected
function showBadgeRejected() {
    resultAcceptedElement.classList.remove(...resultAcceptedElement.classList);
    resultAcceptedElement.classList.add("badge");
    resultAcceptedElement.classList.add("badge-danger");
    resultAcceptedElement.textContent = "rejected";
}

// badge for details
function showBadgeDetails(details) {
    resultExceptionElement.textContent = details;
}