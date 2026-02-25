var ACCEPTOR_sbs = new Acceptor();

var currentStateSBS

var positionSBS

var wordSBS

function colourNodeVisited(i) {
    var node = cy.$id(i);
    node.style('background-color', nodeVisitedColor);
    node.style('border-width', 4);
    node.style('border-color', '#000000');
    node.style('border-style','solid');
}

function colourNodeNormal(i) {
    var node = cy.$id(i);
    if (ACCEPTOR_sbs.acceptedStates.includes(currentStateSBS)) {
        node.style('background-color', nodeFinalColor);
    } else {
        node.style('background-color', nodeBasicColor);
    }
}

var startSBSSimulation = function(word) {
    ACCEPTOR_sbs.refreshFromGraph();
    currentStateSBS = ACCEPTOR_sbs.startState;
    positionSBS = 0;
    wordSBS = word;
    colourNodeVisited(currentStateSBS);
}

var nextNodeSBS = function() {
    const symbolInPosition = wordSBS[positionSBS]
    const matchingTransition = ACCEPTOR_sbs.transitions.find((f) => f.from === currentStateSBS && f.symbol === symbolInPosition);
    if (!matchingTransition) {
        return {"rejected" : false, "exception" : "transition at state " + currentStateSBS + " is missing for " + " symbol " + symbolInPosition + "."};
    }
    colourNodeNormal(currentStateSBS);
    currentStateSBS = matchingTransition.to;
    positionSBS++;
    if (positionSBS === wordSBS.length) {
        if (ACCEPTOR_sbs.acceptedStates.includes(currentStateSBS)) {
            return {"accepted" : true}
        } else {
            return {"rejected" : false, "exception" : currentStateSBS+ "is not final state"}
        }
    }
    colourNodeVisited(currentStateSBS);
    return {};
}