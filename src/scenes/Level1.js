class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
    }
    create(){
        this.worldWidth = 1600;
        this.worldHeight = 1200;
        this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x2d4a22);

        this.player = this.physics.add.sprite(400, 300, 'cat_walk_down');
        this.player.body.setCollideWorldBounds(true);
        this.player.rescuedCats = 0;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            }
        );

        
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('cat_walk_up', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('cat_walk_down', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_left', frames: this.anims.generateFrameNumbers('cat_walk_left', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('cat_walk_right', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_up_left', frames: this.anims.generateFrameNumbers('cat_walk_up_left', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_up_right', frames: this.anims.generateFrameNumbers('cat_walk_up_right', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_down_left', frames: this.anims.generateFrameNumbers('cat_walk_down_left', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_down_right', frames: this.anims.generateFrameNumbers('cat_walk_down_right', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });

        this.catsToRescue = this.physics.add.staticGroup();
        this.spawnCats(10);
        this.carriedCat = null;
        this.physics.add.overlap(
            this.player,
            this.catsToRescue,
            this.pickUpCat,
            null,
            this
        );

        this.dropOffZone = this.add.rectangle(100, 140, 90, 50, 0x00ff99, 0.3);
        this.dropOffZone.setStrokeStyle(2, 0x00ff99, 0.8);
        this.physics.add.existing(this.dropOffZone, true);

        this.safeZone = this.add.image(100, 100, 'rescue_center');
        this.physics.add.existing(this.safeZone, true);
        this.safeZone.body.setSize(40, 40);
        this.safeZone.body.setOffset(20, 20);

        this.physics.add.collider(this.player, this.safeZone);
        this.physics.add.overlap(
            this.player,
            this.dropOffZone,
            this.dropOffCat,
            null,
            this
        );

        this.enemies = this.physics.add.group();
        this.spawnEnemies(20);
        this.physics.add.collider(this.enemies, this.enemies);

        this.time.addEvent({
            delay: 2000,
            callback: this.moveEnemies,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.hitByEnemy,
            null,
            this
        );

        
        
    }
    update() {
        if (this.gameOver) return;
        const SPEED = 160;
        const BODY = this.player.body
        BODY.setVelocity(0);

        const LEFT  = this.cursors.left.isDown  || this.wasd.left.isDown;
        const RIGHT = this.cursors.right.isDown || this.wasd.right.isDown;
        const UP    = this.cursors.up.isDown    || this.wasd.up.isDown;
        const DOWN  = this.cursors.down.isDown  || this.wasd.down.isDown;

        let moving = false;

        if (UP && LEFT) {
            BODY.setVelocity(-SPEED, -SPEED);
            this.player.anims.play('walk_up_left', true);
            moving = true;
        } else if (UP && RIGHT) {
            BODY.setVelocity(SPEED, -SPEED);
            this.player.anims.play('walk_up_right', true);
            moving = true;
        } else if (DOWN && LEFT) {
            BODY.setVelocity(-SPEED, SPEED);
            this.player.anims.play('walk_down_left', true);
            moving = true;
        } else if (DOWN && RIGHT) {
            BODY.setVelocity(SPEED, SPEED);
            this.player.anims.play('walk_down_right', true);
            moving = true;
        } else if (LEFT) {
            BODY.setVelocityX(-SPEED);
            this.player.anims.play('walk_left', true);
            moving = true;
        } else if (RIGHT) {
            BODY.setVelocityX(SPEED);
            this.player.anims.play('walk_right', true);
            moving = true;
        } else if (UP) {
            BODY.setVelocityY(-SPEED);
            this.player.anims.play('walk_up', true);
            moving = true;
        } else if (DOWN) {
            BODY.setVelocityY(SPEED);
            this.player.anims.play('walk_down', true);
            moving = true;
        }

        if (!moving) {
            this.player.anims.stop();
        }

        BODY.velocity.normalize().scale(SPEED);

        if (this.carriedCat) {
            this.carriedCat.setPosition(this.player.x + 20, this.player.y -10);
        }
    }

    spawnCats(count) {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(200, this.worldWidth - 200);
            const y = Phaser.Math.Between(200, this.worldHeight - 200);
            const cat = this.add.rectangle(x, y, 24, 24, 0xffdd57);
            this.physics.add.existing(cat, true);
            this.catsToRescue.add(cat);

        }
    }

    pickUpCat(player, cat) {
        if  (this.carriedCat) return;

        cat.setActive(false).setVisible(false);
        cat.body.enable = false;
        this.carriedCat = this.add.rectangle(0, 0, 18, 18, 0xffdd57);
    }

    dropOffCat(player, safeZone) {
        if(!this.carriedCat) return;
        this.carriedCat.destroy();
        this.carriedCat = null;
        this.player.rescuedCats++;
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            console.log("Cat");
            const x = Phaser.Math.Between(400, this.worldWidth - 100);
            const y = Phaser.Math.Between(400, this.worldHeight - 100);
            const ENEMY = this.add.rectangle(x, y, 32, 32, 0xff3333);
            this.physics.add.existing(ENEMY)
            ENEMY.baseWidth = ENEMY.width;
            ENEMY.baseHeight = ENEMY.height;
            ENEMY.body.setSize(ENEMY.baseWidth, ENEMY.baseHeight);
            ENEMY.body.setCollideWorldBounds(true);
            ENEMY.body.setBounce(1);
            this.enemies.add(ENEMY);
        }
    }

    hitByEnemy() {
        if (this.gameOver) return;
        this.gameOver = true;

        this.player.body.setVelocity(0);
        this.player.anims.stop();

        // Freeze all enemies too
        this.enemies.getChildren().forEach(ENEMY => {
            ENEMY.body.setVelocity(0);
        });

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(20);

        this.add.text(400, 260, 'GAME OVER', {
            fontSize: '48px', color: '#ff3333', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.add.text(400, 330, `Rescued ${this.player.rescuedCats} cats`, {
            fontSize: '24px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.add.text(400, 390, 'Press R to restart', {
            fontSize: '18px', color: '#aaaaaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.input.keyboard.once('keydown-R', () => {
            this.gameOver = false;
            this.scene.restart();
        });
    }

    moveEnemies() {
        if (this.gameOver) return;
        this.enemies.getChildren().forEach(ENEMY => {
            const DIRECTIONS = [
                { vx: 80, vy: 0, angle: 90, horizontal: true },
                { vx: -80, vy: 0, angle: -90, horizontal: true },
                { vx: 0, vy: 80, angle: 180, horizontal: false },
                { vx: 0, vy: -80, angle: 0, horizontal: false }
            ];
            const DIR = Phaser.Utils.Array.GetRandom(DIRECTIONS);

            ENEMY.body.setVelocity(DIR.vx, DIR.vy);
            ENEMY.setRotation(Phaser.Math.DegToRad(DIR.angle));

            if (DIR.horizontal) {
                ENEMY.body.setSize(ENEMY.baseHeight, ENEMY.baseWidth);
            } else {
                ENEMY.body.setSize(ENEMY.baseWidth, ENEMY.baseHeight);
            }
        });
    }
}