// Elements
const resultWordElement = document.getElementById("inputWordResultWord");
const resultAcceptedElement = document.getElementById("inputWordResultAccepted");
const resultExceptionElement = document.getElementById("inputWordResultException");

const nextStepButton_t = document.getElementById("nextStepButton_t");
const inputWordElement = document.getElementById("inputWord");

// Runs simulation of the transducer on the input word, step by step
runSimulation = function(event) {
    event.preventDefault();

    const inputWord = inputWordElement.value;
    console.log("Running step-by-step simulation for input word:", inputWord);
    resetResult(inputWord);
    nextStepButton_t.disabled = false;

    // Start simulation step-by-step
    startSBSSimulation_t(inputWord);
}

// Displays input word; clears output and details
function resetResult(inputWord) {
    resultWordElement.textContent = inputWord;
    resultAcceptedElement.textContent = "";
    resultAcceptedElement.className = "badge";
    resultExceptionElement.textContent = "";
}

// Goes to the next step of the simulation
nextStep = function(event) {
    event.preventDefault();

    const result = nextNodeSBS_t();

    // Show partial output while stepping
    if (!result.done && result.outputSoFar !== undefined) {
        resultAcceptedElement.textContent = result.outputSoFar || "ε";
        resultAcceptedElement.className = "badge badge-light";
    }

    if (result.done) {
        if (result.output !== null) {
            simulationOutput(result.output);
        } else {
            simulationError(result.exception || "");
        }
    }
}

// Simulation finished with a valid output
function simulationOutput(output) {
    resultAcceptedElement.textContent = output === "" ? "ε (empty)" : output;
    resultAcceptedElement.className = "badge badge-success";
    resultExceptionElement.textContent = "";
    simulationEnd();
}

// Simulation finished with an error (no valid transition)
function simulationError(details) {
    resultAcceptedElement.textContent = "Error";
    resultAcceptedElement.className = "badge badge-danger";
    showBadgeDetails(details);
    simulationEnd();
}

// Simulation over — disable Next button
function simulationEnd() {
    nextStepButton_t.disabled = true;
}

// Badge for details / error message
function showBadgeDetails(details) {
    resultExceptionElement.textContent = details;
}