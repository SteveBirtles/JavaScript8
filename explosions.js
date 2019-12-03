let explosionImage = new Image();

let loadExplosionImage = new Promise(function(resolve) {
    explosionImage.src = "explosion.png";
    explosionImage.onload = () => resolve();
});

let explosions = [];

class Explosion {

    constructor(x, y, size) {

        this.x = x;
        this.y = y;
        this.size = size;
        this.frame = 0;
        this.expired = false;

    }

    draw(context) {
        context.drawImage(explosionImage,
                            explosionImage.height * Math.floor(this.frame),
                            0, explosionImage.height, explosionImage.height,
                            this.x - this.size/2, this.y - this.size/2,
                            this.size, this.size);
    }

    update(frameLength) {
        if (this.frame >= 26) this.expired = true;
        this.frame += 20 * frameLength;
    }

}
