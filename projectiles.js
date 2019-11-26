let projectiles = [];

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
