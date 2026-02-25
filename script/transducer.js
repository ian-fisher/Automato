class TransducerTransition {
    constructor(from, inputSymbol, outputSymbol, to) {
        this.from = from;
        this.inputSymbol = inputSymbol;
        this.outputSymbol = outputSymbol;
        this.to = to;
    }
}

class Transducer {
    constructor() {
        this.transitions = [];
        this.startState = null;
    }

    runTransducer(word) {
        if (this.startState === null) {
            return {output: null, exception: "Start state not defined"};
        }

        let currentState = this.startState;
        let output = [];
        var nodes = cyTransducer.json().elements.nodes;

        for (let i = 0; i < word.length; i++) {
            const symbol = word[i];
            const match = this.transitions.find(t => t.from === currentState && t.inputSymbol === symbol);

            if (!match) {
                const nodeLabel = (nodes.find(n => n.data.id === currentState) || {}).data?.label || currentState;
                return {output: null, exception: `No transition at state "${nodeLabel}" for symbol "${symbol}"`};
            }

            output.push(match.outputSymbol);
            currentState = match.to;
        }

        return {output};
    }

    refreshFromGraph() {
        this.transitions = [];
        this.startState = null;

        var edges = cyTransducer.json().elements.edges;
        var nodes = cyTransducer.json().elements.nodes;

        for (let n = 0; n < nodes.length; n++) {
            if (nodes[n].data.isInitial === true) {
                this.startState = nodes[n].data.id;
            }
        }

        for (let e = 0; e < edges.length; e++) {
            const label = edges[e].data.label || "";
            const slashIdx = label.indexOf("/");
            let inputSymbol, outputSymbol;

            if (slashIdx !== -1) {
                inputSymbol  = label.substring(0, slashIdx);
                outputSymbol = label.substring(slashIdx + 1);
            } else {
                inputSymbol  = label;
                outputSymbol = "";
            }

            this.transitions.push(new TransducerTransition(
                edges[e].data.source,
                inputSymbol,
                outputSymbol,
                edges[e].data.target
            ));
        }
    }
}

let TRANSDUCER = new Transducer();

function refreshTransducerTable() {
    var edges = cyTransducer.json().elements.edges || [];
    var nodes = cyTransducer.json().elements.nodes || [];

    var nodeLabel = {};
    nodes.forEach(n => { nodeLabel[n.data.id] = n.data.label || n.data.id; });

    var tbody = document.getElementById("transducerTableBody");
    tbody.innerHTML = "";

    edges.forEach(function(e) {
        const label = e.data.label || "";
        const slashIdx = label.indexOf("/");
        const inputSym  = slashIdx !== -1 ? label.substring(0, slashIdx) : label;
        const outputSym = slashIdx !== -1 ? label.substring(slashIdx + 1) : "";

        const from = nodeLabel[e.data.source] || e.data.source;
        const to   = nodeLabel[e.data.target] || e.data.target;

        var tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${from} → ${to}</td>
            <td><input type="text" class="form-control" value="${inputSym}" placeholder="ε" maxlength="1"
                onchange="editEdgeInput('${e.data.id}', this.value)"></td>
            <td><input type="text" class="form-control" value="${outputSym}" placeholder="ε"
                onchange="editEdgeOutput('${e.data.id}', this.value)"></td>
        `;
        tbody.appendChild(tr);
    });
}

(function() {
    var _origSaveGraph = saveGraph;
    saveGraph = function() {
        _origSaveGraph();
        refreshTransducerTable();
    };
})();

document.addEventListener("DOMContentLoaded", function() {
    refreshTransducerTable();
});

function inputWordSubmitHandler(event) {
    event.preventDefault();

    var word = document.getElementById("inputWord").value;
    TRANSDUCER.refreshFromGraph();

    var result = TRANSDUCER.runTransducer(word);

    document.getElementById("inputWordResultWord").textContent = word;

    var outputBadge = document.getElementById("inputWordResultAccepted");
    var detailBadge = document.getElementById("inputWordResultException");

    if (result.output !== null) {
        outputBadge.textContent = result.output === "" ? "ε (empty)" : result.output;
        outputBadge.className = "badge badge-success";
        detailBadge.textContent = "";
    }
    else {
        outputBadge.textContent = "Error";
        outputBadge.className = "badge badge-danger";
        detailBadge.textContent = result.exception || "";
    }
}

function editEdgeInput(edgeId, newInput) {
    var edge = cyTransducer.edges(`[id = "${edgeId}"]`);
    var currentLabel = edge.data('label') || "";
    var outputSym = currentLabel.includes("/") ? currentLabel.split("/")[1] : "";
    edge.data('label', newInput + "/" + outputSym);
    saveGraph();
}

function editEdgeOutput(edgeId, newOutput) {
    var edge = cyTransducer.edges(`[id = "${edgeId}"]`);
    var currentLabel = edge.data('label') || "";
    var inputSym = currentLabel.includes("/") ? currentLabel.split("/")[0] : currentLabel;
    edge.data('label', inputSym + "/" + newOutput);
    saveGraph();
}