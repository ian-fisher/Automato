var TRANSDUCER_sbs = new Transducer();

var currentStateSBS_t;
var positionSBS_t;
var wordSBS_t;
var outputSBS_t;


nodeVisitedColor = '#00ff04'
nodeBasicColor = '#D3D3D3';

function colourNodeVisited_t(id) {
    cyTransducer.$id(id).style('background-color', nodeVisitedColor);
}

function colourNodeNormal_t(id) {
    cyTransducer.$id(id).style('background-color', nodeBasicColor);
}

function restoreAllNodeColors_t() {
    cyTransducer.nodes().forEach(function(node) {
        node.style('background-color', nodeBasicColor);
    });
}

var startSBSSimulation_t = function(word) {
    // Use scriptTransducer's restoreGraph if available, otherwise reset colours ourselves
    if (typeof restoreGraph === 'function') {
        restoreGraph();
    } else {
        restoreAllNodeColors_t();
    }

    TRANSDUCER_sbs.refreshFromGraph();

    if (currentStateSBS_t) {
        colourNodeNormal_t(currentStateSBS_t);
    }

    currentStateSBS_t = TRANSDUCER_sbs.startState;
    positionSBS_t = 0;
    wordSBS_t = word;
    outputSBS_t = [];

    colourNodeVisited_t(currentStateSBS_t);
}

var nextNodeSBS_t = function() {
    if (positionSBS_t >= wordSBS_t.length) {
        return { done: true, output: outputSBS_t.join("") };
    }

    const symbolInPosition = wordSBS_t[positionSBS_t];
    const matchingTransition = TRANSDUCER_sbs.transitions.find(
        (t) => t.from === currentStateSBS_t && t.inputSymbol === symbolInPosition
    );

    if (!matchingTransition) {
        return {
            done: true,
            output: null,
            exception: `No transition at state "${currentStateSBS_t}" for symbol "${symbolInPosition}"`
        };
    }

    outputSBS_t.push(matchingTransition.outputSymbol);
    colourNodeNormal_t(currentStateSBS_t);
    currentStateSBS_t = matchingTransition.to;
    positionSBS_t++;
    colourNodeVisited_t(currentStateSBS_t);

    if (positionSBS_t === wordSBS_t.length) {
        return { done: true, output: outputSBS_t.join("") };
    }

    return { done: false, outputSoFar: outputSBS_t.join("") };
}

var turnOff_t = function() {
    if (currentStateSBS_t) {
        colourNodeNormal_t(currentStateSBS_t);
    }
}