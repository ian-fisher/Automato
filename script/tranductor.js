class Translation {
    constructor() {
        this.inState = inState;
        this.output = output;
    }
}

class Transductor {
    constructor() {
        this.startState = null;
        this.transitions = [];
        this.translateList = [];
    }

    runTransductor(word) {
        let currentState = this.startState;
        var outputWord = [];

        var edges =  cy.json().elements.edges;
        var nodes = cy.json().elements.nodes;


        if(this.startState === null) {
            return {"output" : null, "exception" : "startState not defined"};
        }

        if(this.startState === null) {
            return {"output" : null, "exception" : "startState not defined"};
        }

        for (let position = 0; position < word.length; position++){
            const symbolInPosition = word[position]

            const matchingTranslation = this.translateList.find((f) => f.inState === currentState).output;
            outputWord.push(matchingTranslation);

            const matchingTransition = this.transitions.find((f) => f.from === currentState && f.symbol === symbolInPosition);
            if (!matchingTransition) {
                return {"output" : outputWord, "exception" : "transition at state " + nodes[currentState].data.label + " is missing for symbol " + symbolInPosition };
            }

            currentState = matchingTransition.to;
        }
    }

    refreshFromGraph() {
        this.transitions = [];
        this.startState = null;

        var edges =  cy.json().elements.edges;
        var nodes = cy.json().elements.nodes;

        for (let n = 0; n < nodes.length; n++){
            if(nodes[n].data.isInitial === true){
                this.startState = nodes[n].data.id;
            }
        }

        for (let e = 0; e < edges.length; e++){
            this.transitions.push(new Transition(edges[e].data.source, edges[e].data.label, edges[e].data.target));
        }
    }

    refreshTranslateList() {}
}