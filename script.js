const config = {
    type: Phaser.AUTO,

    // ❌ REMOVE fixed width/height
    // width: 400,
    // height: 700,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 700
    },

    physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }
    },

    scene: { preload, create, update }
};

let player, obstacles, score = 0, scoreText, infoText;
let gameStarted = false;

new Phaser.Game(config);

// ---------- PRELOAD ----------
function preload() {
    this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");

    // 🔥 CHANGED BLOCK (better looking)
    this.load.image("block", "https://labs.phaser.io/assets/sprites/meteor.png");

    this.load.image("bg", "https://labs.phaser.io/assets/skies/deepblue.png");
}

// ---------- CREATE ----------
function create() {
    this.add.image(200, 350, "bg").setScale(1.5);

    player = this.physics.add.sprite(200, 620, "player");
    player.setScale(0.9);
    player.setCollideWorldBounds(true);

    obstacles = this.physics.add.group();

    scoreText = this.add.text(20, 20, "Score: 0", {
        fontSize: "24px",
        fill: "#ffffff"
    });

    infoText = this.add.text(200, 350, "Tap to Start", {
        fontSize: "28px",
        fill: "#ffffff",
        align: "center"
    }).setOrigin(0.5);

    this.input.on("pointerdown", (pointer) => {
        if (!gameStarted) {
            gameStarted = true;
            infoText.setText("");
        }

        if (pointer.x > player.x) {
            player.setVelocityX(300);
        } else {
            player.setVelocityX(-300);
        }
    });

    this.input.on("pointerup", () => {
        player.setVelocityX(0);
    });

    this.physics.add.overlap(player, obstacles, endGame, null, this);

    this.time.addEvent({
        delay: 800,
        loop: true,
        callback: spawnObstacle,
        callbackScope: this
    });
}

// ---------- UPDATE ----------
function update() {
    if (!gameStarted) return;

    score += 0.05;
    scoreText.setText("Score: " + Math.floor(score));

    obstacles.children.iterate((obs) => {
        if (obs && obs.y > 750) {
            obs.destroy();
        }
    });
}

// ---------- SPAWN ----------
function spawnObstacle() {
    if (!gameStarted) return;

    const x = Phaser.Math.Between(40, 360);
    const speed = Phaser.Math.Between(220, 380);

    const block = obstacles.create(x, 0, "block");

    // ⚠️ IMPORTANT: meteors are bigger → scale properly
    block.setScale(0.7);

    block.setVelocityY(speed);
}

// ---------- GAME OVER ----------
function endGame() {
    this.physics.pause();
    player.setTint(0xff0000);

    infoText.setText(
        "Game Over\nScore: " + Math.floor(score) + "\nTap to Restart"
    );

    gameStarted = false;
    score = 0;

    this.input.once("pointerdown", () => {
        location.reload();
    });
}