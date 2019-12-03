const ALIEN_IMAGE_COUNT = 15;

const alienImages = [];

let aliens = [];
let selectedAlienType = 0;

let movementStats = [{speed: 250, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Alien 1
                        {speed: 235, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Alien 2
                        {speed: 220, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Alien 3
                        {speed: 205, homing: false, wobbleRate: 2.5, wobbleSpeed: 200}, //Alien 4
                        {speed: 190, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Alien 5
                        {speed: 175, homing: false, wobbleRate: 5, wobbleSpeed: 300}, //Alien 6
                        {speed: 160, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Alien 7
                        {speed: 145, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Alien 8
                        {speed: 130, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Alien 9
                        {speed: 115, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Alien 10
                        {speed: 100, homing: false, wobbleRate: 1, wobbleSpeed: 200}, //Alien 11
                        {speed: 85, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Alien 12
                        {speed: 70, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Alien 13
                        {speed: 55, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Alien 14
                        {speed: 40, homing: false, wobbleRate: 0, wobbleSpeed: 0}] //Alien 15

let weaponStats = [{count: 1, angleSpread: 0, xSpread: 0, reloadRate: 1, burstSize: 1, burstDelay: 0, homing: false}, //Alien 1
                    {count: 2, angleSpread: 0, xSpread: 15, reloadRate: 1.5, burstSize: 1, burstDelay: 0, homing: false}, //Alien 2
                    {count: 5, angleSpread: 0.025, xSpread: 0, reloadRate: 2, burstSize: 1, burstDelay: 0, homing: false}, //Alien 3
                    {count: 2, angleSpread: 0.5, xSpread: 10, reloadRate: 1, burstSize: 3, burstDelay: 2, homing: false}, //Alien 4
                    {count: 4, angleSpread: 0.05, xSpread: 0, reloadRate: 4, burstSize: 1, burstDelay: 0, homing: true}, //Alien 5
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 1, burstSize: 4, burstDelay: 1, homing: false}, //Alien 6
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 0.33, burstSize: 1, burstDelay: 0, homing: true}, //Alien 7
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 2, burstSize: 20, burstDelay: 1, homing: false}, //Alien 8
                    {count: 16, angleSpread: 0.2, xSpread: 0, reloadRate: 6, burstSize: 1, burstDelay: 0, homing: false}, //Alien 9
                    {count: 2, angleSpread: 0, xSpread: 20, reloadRate: 1, burstSize: 20, burstDelay: 1, homing: false}, //Alien 10
                    {count: 30, angleSpread: 0.02, xSpread: 0, reloadRate: 4, burstSize: 1, burstDelay: 0, homing: false}, //Alien 11
                    {count: 6, angleSpread: 0, xSpread: 3, reloadRate: 1, burstSize: 3, burstDelay: 1, homing: false}, //Alien 12
                    {count: 3, angleSpread: 0, xSpread: 5, reloadRate: 0.1, burstSize: 1, burstDelay: 0, homing: false}, //Alien 13
                    {count: 5, angleSpread: 0.01, xSpread: 0, reloadRate: 0.5, burstSize: 5, burstDelay: 2, homing: true}, //Alien 14
                    {count: 60, angleSpread: 0.01, xSpread: 0, reloadRate: 1, burstSize: 5, burstDelay: 1, homing: false}]; //Alien 15

let loadAlienImages = new Promise(function(resolve) {

    let loadedImageCount = 0;

    let loadCheck = function() {
        loadedImageCount++;
        if (loadedImageCount === ALIEN_IMAGE_COUNT) {
            resolve();
        }
    }

    for (let n = 1; n <= 15; n++) {
        let img = new Image();
        img.src = "alien" + n + ".png";
        img.onload = () => loadCheck();
        alienImages.push(img);
    }

});

function saveAliens() {

    let data = [];
    for (let alien of aliens) {
        data.push({type: alien.type, startX: alien.startX, startTime: alien.startTime});
    }

    localStorage.setItem("leveldata", JSON.stringify(data))

}

function loadAlens() {

    let json = localStorage.getItem("leveldata");
    if (json != "undefined" && json != null) {

        aliens = [];
        for (let alien of JSON.parse(json)) {
            aliens.push(new Alien(alien.type, alien.startX, alien.startTime));
        }
    }

}

class Alien {

    constructor(type, x, t) {

        this.type = type;
        this.startX = x;
        this.startTime = t;

        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = movementStats[type].speed;
        this.image = alienImages[type];
        this.reloadTimer = Math.random();
        this.reloadRate = weaponStats[type].reloadRate;

        this.wobbleTimer = 0;
        this.spawnTimer = 0;

    }

    restart() {
        this.health = Math.floor(Math.pow(this.type, 1.333));
        this.alive = true;
        this.x = this.startX;
        this.y = -this.image.height/2;
        this.spawnTimer = this.startTime/10;
    }

    draw(context, editing) {
        if (editing) {
            context.drawImage(this.image, this.startX - this.image.width/2, h - this.startTime - this.image.height/2);
        } else {
            if (!this.alive) return;
            context.drawImage(this.image, this.x - this.image.width/2, this.y - this.image.height/2);
        }
    }

    update(frameLength) {

        if (!this.alive) return;

        if (this.spawnTimer > 0) {

            this.spawnTimer -= frameLength

        } else {

            if (movementStats[this.type].homing) {
                let angle = Math.atan2(player.x - this.x, player.y - this.y);
                this.dx = movementStats[this.type].speed * Math.sin(angle);
                this.dy = movementStats[this.type].speed;
            }

            if (movementStats[this.type].wobbleSpeed > 0) {
                this.wobbleTimer += frameLength * movementStats[this.type].wobbleRate;
                this.dx = Math.cos(this.wobbleTimer) * movementStats[this.type].wobbleSpeed;
                this.dy = movementStats[this.type].speed;
            }

            this.x += frameLength * this.dx;
            this.y += frameLength * this.dy;
            if (this.y > h+100) this.alive = false;

            this.reloadTimer -= frameLength / this.reloadRate;
            if (this.reloadTimer < 0) {
                for (let n = 1; n <= weaponStats[this.type].count; n++) {
                    for (let b = 0; b < weaponStats[this.type].burstSize; b++) {
                        let f = -(weaponStats[this.type].count-1) + (n-1)*2
                        let x = this.x + weaponStats[this.type].xSpread * f;
                        let y = this.y + this.image.height/2;
                        let angle = weaponStats[this.type].angleSpread * f;
                        if (weaponStats[this.type].homing) {
                            angle += Math.atan2(player.x - this.x, player.y - this.y);
                        }
                        let dx = this.dx + 500 * Math.sin(angle);
                        let dy = this.dy + 500 * Math.cos(angle);
                        projectiles.push(new Projectile(x, y, dx, dy, false, b*weaponStats[this.type].burstDelay));
                    }
                }
                this.reloadTimer += 1;
            }
        }
    }

}
