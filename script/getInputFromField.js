let eingabewortVar = "";

const fieldValue = document.getElementById('textFieldID');
const display = document.getElementById('inputInWeb');
const submitBtn = document.getElementById('submitButton');

function getEingabewort() {
    eingabewortVar = fieldValue.value;
    display.textContent = eingabewortVar;
}

submitBtn.addEventListener('click', getEingabewort);
display.textContent = eingabewortVar;