
inputWordSubmitHandler = function (event) {
    // Prevent page reload
    event.preventDefault();

    // Get input word
    const inputWord = document.getElementById("inputWord").value;
    console.log("Input word submitted:", inputWord);

    // Run acceptor, get result
    const result = checkWordAndPrint(inputWord);

    // UI elements
    const resultWordElement = document.getElementById("inputWordResultWord");
    const resultAcceptedElement = document.getElementById("inputWordResultAccepted");
    const resultExceptionElement = document.getElementById("inputWordResultException");

    // Update UI with result
    resultWordElement.textContent = inputWord;
    if (result.accepted) {
        resultAcceptedElement.classList.remove(...resultAcceptedElement.classList);
        resultAcceptedElement.classList.add("badge");
        resultAcceptedElement.classList.add("badge-success");
    } 
    else {
        resultAcceptedElement.classList.remove(...resultAcceptedElement.classList);
        resultAcceptedElement.classList.add("badge");
        resultAcceptedElement.classList.add("badge-danger");
    }
    resultAcceptedElement.textContent = result.accepted ? "accepted" : "not accepted";
    if (result.exception) {
        resultExceptionElement.textContent = result.exception;
    } else {
        resultExceptionElement.textContent = "";
    }
}