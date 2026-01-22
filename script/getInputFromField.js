let counter = 0;

function updateCounter() {
    counter++;
    document.getElementById("count").textContent = counter;
}

document.getElementById("button").onclick = updateCounter;