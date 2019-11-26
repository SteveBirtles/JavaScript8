let w = 0, h = 0;
let lastTimestamp = 0;

const pressedKeys = {};
const mousePosition = {x: 0, y: 0};

const sprites = [];
const imageCount = 16;
let loadedImageCount = 0;

let enemies = [];
let projectiles = [];
let selectedType = 1;
let keyDown = false;

let movementStats = [{}, //Player
                        {speed: 250, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 1
                        {speed: 235, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 2
                        {speed: 220, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 3
                        {speed: 205, homing: false, wobbleRate: 2.5, wobbleSpeed: 200}, //Enemy 4
                        {speed: 190, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 5
                        {speed: 175, homing: false, wobbleRate: 5, wobbleSpeed: 300}, //Enemy 6
                        {speed: 160, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 7
                        {speed: 145, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 8
                        {speed: 130, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 9
                        {speed: 115, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 10
                        {speed: 100, homing: false, wobbleRate: 1, wobbleSpeed: 200}, //Enemy 11
                        {speed: 85, homing: false, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 12
                        {speed: 70, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 13
                        {speed: 55, homing: true, wobbleRate: 0, wobbleSpeed: 0}, //Enemy 14
                        {speed: 40, homing: false, wobbleRate: 0, wobbleSpeed: 0}] //Enemy 15

let weaponStats = [{}, //Player
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 1, burstSize: 1, burstDelay: 0, homing: false}, //Enemy 1
                    {count: 2, angleSpread: 0, xSpread: 15, reloadRate: 1.5, burstSize: 1, burstDelay: 0, homing: false}, //Enemy 2
                    {count: 5, angleSpread: 0.025, xSpread: 0, reloadRate: 2, burstSize: 1, burstDelay: 0, homing: false}, //Enemy 3
                    {count: 2, angleSpread: 0.5, xSpread: 10, reloadRate: 1, burstSize: 3, burstDelay: 2, homing: false}, //Enemy 4
                    {count: 4, angleSpread: 0.05, xSpread: 0, reloadRate: 4, burstSize: 1, burstDelay: 0, homing: true}, //Enemy 5
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 1, burstSize: 4, burstDelay: 1, homing: false}, //Enemy 6
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 0.33, burstSize: 1, burstDelay: 0, homing: true}, //Enemy 7
                    {count: 1, angleSpread: 0, xSpread: 0, reloadRate: 2, burstSize: 20, burstDelay: 1, homing: false}, //Enemy 8
                    {count: 16, angleSpread: 0.2, xSpread: 0, reloadRate: 6, burstSize: 1, burstDelay: 0, homing: false}, //Enemy 9
                    {count: 2, angleSpread: 0, xSpread: 20, reloadRate: 1, burstSize: 20, burstDelay: 1, homing: false}, //Enemy 10
                    {count: 30, angleSpread: 0.02, xSpread: 0, reloadRate: 4, burstSize: 1, burstDelay: 0, homing: false}, //Enemy 11
                    {count: 6, angleSpread: 0, xSpread: 3, reloadRate: 1, burstSize: 3, burstDelay: 1, homing: false}, //Enemy 12
                    {count: 3, angleSpread: 0, xSpread: 5, reloadRate: 0.1, burstSize: 1, burstDelay: 0, homing: false}, //Enemy 13
                    {count: 5, angleSpread: 0.01, xSpread: 0, reloadRate: 0.5, burstSize: 5, burstDelay: 2, homing: true}, //Enemy 14
                    {count: 60, angleSpread: 0.01, xSpread: 0, reloadRate: 1, burstSize: 5, burstDelay: 1, homing: false}]; //Enemy 15

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('scrollerCanvas');
    canvas.width = w;
    canvas.height = h;
}

function loadCheck() {

    loadedImageCount++;
    if (loadedImageCount === imageCount) {
        window.requestAnimationFrame(gameFrame);
    }

}

function pageLoad() {

    window.addEventListener("resize", fixSize);
    fixSize();

    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    const canvas = document.getElementById('scrollerCanvas');
    canvas.addEventListener('mousemove', event => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    }, false);

    canvas.addEventListener('click', event => {
        enemies.push(new Enemy(selectedType, mousePosition.x, mousePosition.y));
    }, false);

    let img = new Image();
    img.src = "player.png";
    img.onload = () => loadCheck();
    sprites.push(img);

    for (let n = 1; n <= 15; n++) {
        let img = new Image();
        img.src = "enemy" + n + ".png";
        img.onload = () => loadCheck();
        sprites.push(img);
    }




}

class Enemy {

    constructor(type, x, y) {

        this.type = type;
        this.x = x;
        this.y = y;

        this.dx = 0;
        this.dy = movementStats[type].speed;
        this.image = sprites[type];
        this.timer = Math.random();
        this.reloadRate = weaponStats[type].reloadRate;
        this.alive = true;

        this.wobbleTimer = 0;

    }

    draw(context) {
        context.drawImage(this.image, this.x - this.image.width/2, this.y - this.image.height/2);
    }

    update(frameLength) {

        if (movementStats[this.type].homing) {
            let angle = Math.atan2(mousePosition.x - this.x, mousePosition.y - this.y);
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

        this.timer -= frameLength / this.reloadRate;
        if (this.timer < 0) {
            for (let n = 1; n <= weaponStats[this.type].count; n++) {
                for (let b = 0; b < weaponStats[this.type].burstSize; b++) {
                    let f = -(weaponStats[this.type].count-1) + (n-1)*2
                    let x = this.x + weaponStats[this.type].xSpread * f;
                    let y = this.y + this.image.height/2;
                    let angle = weaponStats[this.type].angleSpread * f;
                    if (weaponStats[this.type].homing) {
                        angle += Math.atan2(mousePosition.x - this.x, mousePosition.y - this.y);
                    }
                    let dx = this.dx + 500 * Math.sin(angle);
                    let dy = this.dy + 500 * Math.cos(angle);
                    projectiles.push(new Projectile(x, y, dx, dy, false, b*weaponStats[this.type].burstDelay));
                }
            }
            this.timer += 1;
        }
    }

}

class Projectile {

    constructor(x, y, dx, dy, friendly, delay) {

        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.friendly = friendly;
        this.expired = false;
        this.delay = delay;

    }

    draw(context) {

        if (this.delay > 0) return;

        if (this.friendly) {
            context.fillStyle = 'limegreen';
        } else {
            context.fillStyle = 'orange';
        }

        context.beginPath();
        context.arc(this.x, this.y, 5, 0, 2*Math.PI);
        context.fill();

    }

    update(frameLength) {

        if (this.delay > 0) {
            this.delay--;
        } else {
            this.expired = false;
            this.x += frameLength * this.dx;
            if (this.x < -5 || this.x > w+5) this.expired = true;
            this.y += frameLength * this.dy;
            if (this.y < -5 || this.y > h+5) this.expired = true;
        }

    }

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

    if (pressedKeys["PageUp"]) {
        if (!keyDown) {
            selectedType--;
            if (selectedType < 1) selectedType = 15;
            keyDown = true;
        }
    } else if (pressedKeys["PageDown"]) {
        if (!keyDown) {
            selectedType++;
            if (selectedType > 15) selectedType = 1;
            keyDown = true;
        }
    } else {
        keyDown = false;
    }

}

function processes(frameLength) {

    for (let enemy of enemies) {
        enemy.update(frameLength);
    }

    for (let projectile of projectiles) {
        projectile.update(frameLength);
    }

    enemies = enemies.filter(i => i.alive);
    projectiles = projectiles.filter(p => !p.expired);

}

function outputs() {

    const canvas = document.getElementById('scrollerCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = 'navy';
    context.fillRect(0,0,w,h);

    for (let enemy of enemies) {
        enemy.draw(context);
    }

    for (let projectile of projectiles) {
        projectile.draw(context);
    }

    context.globalAlpha = 0.5;
    let selectedEnemyImage = sprites[selectedType];
    context.drawImage(selectedEnemyImage, mousePosition.x - selectedEnemyImage.width/2, mousePosition.y - selectedEnemyImage.height/2);
    context.globalAlpha = 1;

}
