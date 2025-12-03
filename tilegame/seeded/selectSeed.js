const url = window.location.search;
const urlParams = new URLSearchParams(url);

const vundetSpil = urlParams.get("game");

const seedin1 = document.getElementById("i1");
const seedin2 = document.getElementById("i2");
const seedin3 = document.getElementById("i3");
const seedin4 = document.getElementById("i4");
const seedin5 = document.getElementById("i5");
const seedin = [seedin1,seedin2,seedin3,seedin4,seedin5];

const rand3 = document.getElementById("rand3");
const rand4 = document.getElementById("rand4");
const rand5 = document.getElementById("rand5");
const rand6 = document.getElementById("rand6");
const rand7 = document.getElementById("rand7");

const seedSelect = document.getElementById("seed-selector");
const won = document.getElementById("won");
const nwon = document.getElementById("nwon");
const clearselectbtn = document.getElementById("clear-select");

const startbtn = document.getElementById("start");

getSavedSeeds();

rand3.addEventListener("click", e => {
    setInput("0"+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9))
})

rand4.addEventListener("click", e => {
    setInput(""+get_rand_between(1,2)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9))
})

rand5.addEventListener("click", e => {
    setInput(""+get_rand_between(3,6)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9))
})

rand6.addEventListener("click", e => {
    setInput(""+get_rand_between(7,8)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9))
})

rand7.addEventListener("click", e => {
    setInput("9"+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9)+get_rand_between(0,9))
})

function get_rand_between(lower,upper){
    return Math.floor(Math.random()*(upper+1-lower)+lower)
}

function getSavedSeeds(){
    let seeds = localStorage.getItem("seedgames");
    if (!seeds){
        localStorage.setItem("seedgames", JSON.stringify({}));
        seeds = localStorage.getItem("seedgames");
    }
    const parsedSeeds = vundetSpil ? saveSeed(vundetSpil,true) : JSON.parse(seeds)
    for (let [key, value] of Object.entries(parsedSeeds)) {
        opt = document.createElement("option");
        opt.value = key;
        opt.innerHTML = key;
        if (value){
            opt.classList.add("have-won")
            won.appendChild(opt);
        } else {
            nwon.appendChild(opt);
        }
    };
}

function saveSeed(seed, won = false){
    let seeds = JSON.parse(localStorage.getItem("seedgames"));
    seeds[""+seed] = won
    localStorage.setItem("seedgames",JSON.stringify(seeds))
    return seeds;
}

clearselectbtn.addEventListener("click", e => {
    clearSelection();
})

seedSelect.addEventListener("change", e => {
    if (e.target.value != "null") {
        setInput(e.target.value);
    }
})

function setInput(seed){
    if (seed.length != 5){
        return;
    }
    for (let i = 0; i < seed.length; i++) {
        seedin[i].value = parseInt(seed.charAt(i));
    }
}

function clearSelection(){
    seedSelect.selectedIndex = 0;
    setInput("00000");
}

function getInputSeed(){
    return "" + seedin1.value + seedin2.value + seedin3.value + seedin4.value + seedin5.value;
}

startbtn.addEventListener("click", e => {
    beginGame();
})

function beginGame(){
    const seed = getInputSeed();
    const href = `tilegame.html?seed=${seed}`;
    saveSeed(seed)
    window.location.href = href;
}