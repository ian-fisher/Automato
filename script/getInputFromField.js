let eingabewortVar = "";

const fieldValue = document.getElementById('textFieldID');
const display = document.getElementById('inputInWeb');
const submitBtn = document.getElementById('submitButton');
const runBtn = document.getElementById('runButton');
const out = document.getElementById('output');

function getEingabewort() {
    eingabewortVar = fieldValue.value;
    display.textContent = eingabewortVar;
}

function runAcceptor() {
    let tran = new Transition(0, 1, 1);
    let acc = new Acceptor([tran], 0, [1]);
    if (acc.runSim('1')) {
        out.textContent = '1';
    } else {
        out.textContent = '0';
    }

}
submitBtn.addEventListener('click', getEingabewort);
runBtn.addEventListener('click', runAcceptor);

display.textContent = eingabewortVar;