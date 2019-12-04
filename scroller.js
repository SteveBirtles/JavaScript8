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
            loadPlayerImage.then(() => {
                loadExplosionImage.then(() => {
                    player = new Player();
                    window.requestAnimationFrame(gameFrame);
                });
            });
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

    inputs(frameLength);
    processes(frameLength);
    outputs();

    window.requestAnimationFrame(gameFrame);

}

function inputs(frameLength) {

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
                player.restart(w/2, h-100);
            } else {
                mode = EDIT_MODE;
                projectiles = [];
                explosions = [];
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

    } else if (pressedKeys["End"]) {

      if (!keyDown) {
            aliens = [];
            saveAliens();
            keyDown = true;
      }

    } else {

        keyDown = false;

    }

    if (player.alive && mode == PLAY_MODE) {

        if (pressedKeys["ArrowUp"]) {
            player.dy -= 2500*frameLength;
            if (player.dy < -500) player.dy = -500;
        } else if (pressedKeys["ArrowDown"]) {
            player.dy += 2500*frameLength;
            if (player.dy > 500) player.dy = 500;
        } else {
            player.dy *= 1 - 2 * frameLength;
        }

        if (pressedKeys["ArrowLeft"]) {
            player.dx -= 2500*frameLength;
            if (player.dx < -500) player.dx = -500;
        } else if (pressedKeys["ArrowRight"]) {
            player.dx += 2500*frameLength;
            if (player.dx > 500) player.dx = 500;
        } else {
            player.dx *= 1 - 2 * frameLength;
        }

        if (pressedKeys[" "] || pressedKeys["x"] || pressedKeys["z"]) {
            for (let r = 0; r < playerWeapons.length; r++) {
                if (r === 0 && !pressedKeys[" "]) continue;
                if (r === 1 && !pressedKeys["x"]) continue;
                if (r === 2 && !pressedKeys["z"]) continue;
                if (player.reloadTimers[r] < 0) {
                    for (let n = 1; n <= playerWeapons[r].count; n++) {
                        let f = -(playerWeapons[r].count-1) + (n-1)*2
                        let x = player.x + playerWeapons[r].xSpread * f;
                        let y = player.y + playerImage.height/2;
                        let angle = Math.PI + playerWeapons[r].angleSpread * f;
                        let dx = 750 * Math.sin(angle);
                        let dy = 750 * Math.cos(angle);
                        projectiles.push(new Projectile(x, y, dx, dy, true, 0));
                    }
                    player.reloadTimers[r] = 1;
                }
            }
        }

    }

}

function seperation(entity1, entity2) {

    return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));

}

function processes(frameLength) {

    if (mode == PLAY_MODE) {

        player.update(frameLength);

        for (let alien of aliens) {
            alien.update(frameLength);
        }

        for (let explosion of explosions) {
            explosion.update(frameLength);
        }

        for (let projectile of projectiles) {
            projectile.update(frameLength);
            if (projectile.friendly) {
                for (let alien of aliens) {
                    if (!alien.alive || alien.spawnTimer > 0) continue;
                    if (seperation(alien, projectile) < alienImages[alien.type].height/2 + 5) {
                        alien.health -= 1;
                        projectile.expired = true;
                        if (alien.health <= 0) {
                            alien.alive = false;
                            explosions.push(new Explosion(alien.x, alien.y, alienImages[alien.type].width*2));
                        } else {
                            explosions.push(new Explosion(projectile.x, projectile.y, 20));
                        }
                    }
                }
            } else {
                if (player.alive && seperation(player, projectile) < playerImage.height/2 + 5) {
                    projectile.expired = true;
                    player.health -= 1;
                    if (player.health <= 0) {
                        explosions.push(new Explosion(player.x, player.y, 300));
                        player.alive = false;
                    } else {
                        explosions.push(new Explosion(projectile.x, projectile.y, 20));
                    }
                }
            }
        }

        projectiles = projectiles.filter(p => !p.expired);
        explosions = explosions.filter(e => !e.expired);

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

    if (mode == PLAY_MODE) {
        player.draw(context);
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

        context.globalCompositeOperation = "lighter";

        for (let projectile of projectiles) {
            projectile.draw(context);
        }

        for (let explosion of explosions) {
            explosion.draw(context);
        }

        if (player.alive) {
            context.fillStyle = '#00FF00';
            context.fillRect(100, h-50, (w-200)*(player.health/100), 15);
            context.fillStyle = '#220000';
            context.fillRect(100 + (w-200)*(player.health/100), h-50, (w-200)*(1 - player.health/100), 15);
        }

        context.globalCompositeOperation = "source-over";

    }

    if (mode == EDIT_MODE) {
        context.globalAlpha = 0.5;
        let selectedAlienImage = alienImages[selectedAlienType];
        context.drawImage(selectedAlienImage, mousePosition.x - selectedAlienImage.width/2, h-mousePosition.snappedT - selectedAlienImage.height/2);
        context.globalAlpha = 1;
    }

}
