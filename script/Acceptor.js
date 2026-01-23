class Transition {
    constructor (from, symbol, to) {
        this.from = from;
        this.symbol = symbol;
        this.to = to;
    }
}

class Acceptor {
    constructor (states, Transition, startState, acceptedState){
        this.states = states;
        this.Transition = transition;
        this.startState = startState;
        this.acceptedState = acceptedState;
    }

    runSim(input){ //when using this func, we have to use getInutForomField.js it already takes the value of a text field labeled "input"
        let currentState = this.startState
        let position = 0;

        while (position < input.length){
            const symbol = input[position]
            const transition = this.transition.find((f) => f.from === currentState && f.symbol === symbol);

            if (!transition) {
                return {accepted: false, reason: "no transition"}
            }

            currentState = transition.to;
            position++;
        }

        for (let k = 0; k < this.acceptedStates.length; k++) {
            if (this.acceptedStates[k] === currentState) {
                return {accepted: true}
            }
            else {
                return {accepted: false}
            }
        }
    }
}