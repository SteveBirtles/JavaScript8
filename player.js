let player;

let playerImage = new Image();

let loadPlayerImage = new Promise(function(resolve) {
    playerImage.src = "player.png";
    playerImage.onload = () => resolve();
});

let playerWeapons = [{count: 2, angleSpread: 0, xSpread: 15, reloadRate: 0.1},
                     {count: 2, angleSpread: 3.14159/2, xSpread: 0, reloadRate: 0.25},
                     {count: 128, angleSpread: 0.025, xSpread: 0, reloadRate: 10}]

class Player {

    constructor() {
        this.x = 0;
        this.y = 0;
    }

    restart(x, y) {
        this.alive = true;
        this.health = 100;
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.reloadTimers = [];
        for (let r = 0; r < playerWeapons.length; r++) {
            this.reloadTimers.push(0);
        }
    }

    draw(context) {
        if (!player.alive) return;
        context.drawImage(playerImage, this.x - playerImage.width/2, this.y - playerImage.height/2);
    }

    update(frameLength) {
        if (!player.alive) return;
        this.x += frameLength * this.dx;
        this.y += frameLength * this.dy;
        if (this.x < playerImage.width/2) {
            this.x = playerImage.width/2;
            this.dx = 0;
        }
        if (this.x > w - playerImage.width/2) {
            this.x = w - playerImage.width/2;
            this.dx = 0;
        }
        if (this.y < playerImage.height/2) {
            this.y = playerImage.height/2;
            this.dy = 0;
        }
        if (this.y > h - playerImage.height/2) {
            this.y = h - playerImage.height/2;
            this.dy = 0;
        }

        for (let r = 0; r < playerWeapons.length; r++) {
            this.reloadTimers[r] -= frameLength / playerWeapons[r].reloadRate;
        }

        if (this.health < 100) this.health += frameLength;

    }

}
