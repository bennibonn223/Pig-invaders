
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const pigletImg = new Image();
pigletImg.src = 'piglet.png';

class Player {
    constructor() {
        this.x = canvas.width / 2 - 25;
        this.y = canvas.height - 60;
        this.width = 50;
        this.height = 30;
        this.speed = 7;
    }

    draw() {
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) this.x -= this.speed;
        if (direction === 'right' && this.x + this.width < canvas.width) this.x += this.speed;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 10;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

class Piglet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.alive = true;
    }

    draw() {
        if (this.alive) ctx.drawImage(pigletImg, this.x, this.y, this.width, this.height);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

const player = new Player();
const bullets = [];
const piglets = [];
const pigletRows = 4;
const pigletCols = 8;
let pigletDX = 2;
let pigletDY = 30;

for (let row = 0; row < pigletRows; row++) {
    for (let col = 0; col < pigletCols; col++) {
        piglets.push(new Piglet(60 * col + 50, 60 * row + 30));
    }
}

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let hitEdge = false;
    piglets.forEach(p => {
        if (p.alive) {
            p.move(pigletDX, 0);
            if (p.x + p.width > canvas.width || p.x < 0) hitEdge = true;
        }
    });
    if (hitEdge) {
        pigletDX = -pigletDX;
        piglets.forEach(p => p.move(0, pigletDY));
    }

    piglets.forEach(p => p.draw());

    if (keys['ArrowLeft']) player.move('left');
    if (keys['ArrowRight']) player.move('right');
    if (keys[' '] && bullets.length < 5) {
        bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
        keys[' '] = false;
    }

    bullets.forEach((b, i) => {
        b.update();
        b.draw();
        if (b.y < 0) bullets.splice(i, 1);
    });

    bullets.forEach((b, bulletIndex) => {
        piglets.forEach((p) => {
            if (p.alive &&
                b.x < p.x + p.width &&
                b.x + b.width > p.x &&
                b.y < p.y + p.height &&
                b.y + b.height > p.y) {
                p.alive = false;
                bullets.splice(bulletIndex, 1);
            }
        });
    });

    player.draw();
    requestAnimationFrame(gameLoop);
}

pigletImg.onload = () => {
    gameLoop();
};
