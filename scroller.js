const EDIT_MODE = 1;
const PLAY_MODE = 2;

let mode = EDIT_MODE;

let w = 0, h = 0;
let lastTimestamp = 0;

let backgroundImage = new Image();

const pressedKeys = {};
const mousePosition = {x: 0, y: 0, snappedT: 0};

let keyDown = false;
let mouseClicked = false;

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('scrollerCanvas');
    canvas.width = w;
    canvas.height = h;
}

let loadBackground = new Promise(function(resolve) {
    backgroundImage.src = "background.jpg";
    backgroundImage.onload = () => resolve();
});

function pageLoad() {

    window.addEventListener("resize", fixSize);
    fixSize();

    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    const canvas = document.getElementById('scrollerCanvas');
    canvas.addEventListener('mousemove', event => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
        mousePosition.snappedT = h - Math.floor(event.clientY/10)*10
    }, false);

    canvas.addEventListener('click', event => {
        mouseClicked = true;
    }, false);

    loadBackground.then(() => {
        loadAlienImages.then(() => {
            window.requestAnimationFrame(gameFrame);
        });
    });

    loadAlens();
    window.addEventListener('beforeunload', event => {
        saveAliens();
    });

}

function gameFrame(timestamp) {

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    inputs();
    processes(frameLength);
    outputs();

    window.requestAnimationFrame(gameFrame);

}

function inputs() {

    if (mouseClicked && mode == EDIT_MODE) {
        aliens.push(new Alien(selectedAlienType, mousePosition.x, mousePosition.snappedT));
        mouseClicked = false;
    }

    if (pressedKeys["Enter"]) {

        if (!keyDown) {
            if (mode == EDIT_MODE) {
                saveAliens();
                mode = PLAY_MODE;
                for (let alien of aliens) {
                    alien.restart();
                }
            } else {
                mode = EDIT_MODE;
                projectiles = [];
            }
            keyDown = true;
        }

    } else if (pressedKeys["PageUp"]) {

        if (!keyDown && mode == EDIT_MODE) {
            selectedAlienType--;
            if (selectedAlienType < 0) selectedAlienType = 14;
            keyDown = true;
        }

    } else if (pressedKeys["PageDown"]) {

        if (!keyDown && mode == EDIT_MODE) {
            selectedAlienType++;
            if (selectedAlienType > 14) selectedAlienType = 0;
            keyDown = true;
        }

    } else if (pressedKeys["Delete"]) {

        if (!keyDown && mode == EDIT_MODE) {

            aliens = aliens.filter(a => !(Math.abs(a.startX - mousePosition.x) < a.image.width / 2 &&
                                          Math.abs(a.startTime - mousePosition.snappedT) < a.image.height / 2));

            keyDown = true;
        }

    } else {

        keyDown = false;

    }

}

function processes(frameLength) {

    if (mode == PLAY_MODE) {

        for (let alien of aliens) {
            alien.update(frameLength);
        }

        for (let projectile of projectiles) {
            projectile.update(frameLength);
        }

        projectiles = projectiles.filter(p => !p.expired);

    }

}

function outputs() {

    const canvas = document.getElementById('scrollerCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = "black";
    context.fillRect(0,0,w,h);

    if (mode == PLAY_MODE) {
        context.globalAlpha = 0.5;
        context.drawImage(backgroundImage, 0, 0);
        context.globalAlpha = 1;
    } else {
        let seconds = 1;
        for (let y = h-10; y > 0; y -= 10) {
            seconds++;
            if (seconds % 10 == 0) {
                context.strokeStyle = "limegreen";
            } else {
                context.strokeStyle = "darkgreen";
            }
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(w, y);
            context.stroke();
        }
    }

    for (let alien of aliens) {
        alien.draw(context, mode == EDIT_MODE);

        if (Math.abs(alien.startX - mousePosition.x) < alien.image.width / 2 &&
                                      Math.abs(alien.startTime - mousePosition.snappedT) < alien.image.height / 2) {
            context.strokeStyle = "white";
            context.strokeRect(alien.startX - alien.image.width / 2,
                h - alien.startTime - alien.image.height / 2,
                 alien.image.width, alien.image.height);

        }
    }

    if (mode == PLAY_MODE) {
        for (let projectile of projectiles) {
            projectile.draw(context);
        }
    }

    if (mode == EDIT_MODE) {
        context.globalAlpha = 0.5;
        let selectedAlienImage = alienImages[selectedAlienType];
        context.drawImage(selectedAlienImage, mousePosition.x - selectedAlienImage.width/2, h-mousePosition.snappedT - selectedAlienImage.height/2);
        context.globalAlpha = 1;
    }

}
