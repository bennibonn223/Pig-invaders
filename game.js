const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const chickenNuggetImg = new Image();
chickenNuggetImg.src = 'chicken_nugget.png'; 
const pigletImg = new Image();
pigletImg.src = 'piglet.png'; 

class Player {
    constructor() {
        this.x = canvas.width / 2 - 25;
        this.y = canvas.height - 60;
        this.width = 50;
        this.height = 50;
        this.speed = 7;
    }

    draw() {
        ctx.drawImage(chickenNuggetImg, this.x, this.y, this.width, this.height);
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
        if (this.alive) {
            ctx.drawImage(pigletImg, this.x, this.y, this.width, this.height);
        }
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}

let player;
let bullets;
let piglets;
let pigletDX;
let pigletDY;
let gameOver;
let gameWin;

function resetGame() {
    player = new Player();
    bullets = [];
    piglets = [];
    pigletDX = 2;
    pigletDY = 10;
    gameOver = false;
    gameWin = false;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
            piglets.push(new Piglet(60 * col + 50, 60 * row + 30));
        }
    }
}

let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && bullets.length < 5) {
        bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER!", canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText("Press R to Restart", canvas.width / 2 - 150, canvas.height / 2 + 50);
        return;
    }

    if (gameWin) {
        ctx.fillStyle = "green";
        ctx.font = "40px Arial";
        ctx.fillText("YOU WIN!", canvas.width / 2 - 80, canvas.height / 2);
        ctx.fillText("Press R to Restart", canvas.width / 2 - 150, canvas.height / 2 + 50);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let hitEdge = false;
    piglets.forEach(p => {
        if (p.alive) {
            if (p.x + p.width >= canvas.width || p.x <= 0) hitEdge = true;
        }
    });

    piglets.forEach(p => {
        if (p.alive) {
            if (hitEdge) {
                p.move(0, pigletDY);
            } else {
                p.move(pigletDX, 0);
            }

            // 🛑 GAME OVER if Piglets Reach the Player
            if (p.y + p.height >= player.y) {
                gameOver = true;
            }
        }
    });

    if (hitEdge) pigletDX = -pigletDX;
    piglets.forEach(p => p.draw());

    if (keys['ArrowLeft']) player.move('left');
    if (keys['ArrowRight']) player.move('right');

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.update();
        b.draw();

        if (b.y < 0) {
            bullets.splice(i, 1);
            continue;
        }

        for (let j = piglets.length - 1; j >= 0; j--) {
            let p = piglets[j];
            if (p.alive &&
                b.x < p.x + p.width &&
                b.x + b.width > p.x &&
                b.y < p.y + p.height &&
                b.y + b.height > p.y) {
                p.alive = false;
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // 🎉 Check if All Piglets Are Dead = WIN!
    if (piglets.every(p => !p.alive)) {
        gameWin = true;
    }

    player.draw();
    requestAnimationFrame(gameLoop);
}

// 🔄 Restart Game When Pressing "R"
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        resetGame();
        gameLoop();
    }
});

let assetsLoaded = 0;
const totalAssets = 2;

chickenNuggetImg.onload = () => {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        resetGame();
        gameLoop();
    }
};

pigletImg.onload = () => {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        resetGame();
        gameLoop();
    }
};

