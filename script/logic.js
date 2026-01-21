function update() {
    document.getElementById("eingabewortINweb").textContent = document.getElementById("eingabewort").textContent;
}

class Node {
    contructor(name, arrows) {
        this.name = name;
        this.arrows = arrows;
    }
}

class Arrow {
    constructor(to, words) {
        this.to = to;
        this.words = words;
    }
}

document.getElementById("submit").onclick = update;