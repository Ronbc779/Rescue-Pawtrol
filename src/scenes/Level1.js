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
        this.lowVisibilityActive = false;
        this.gameOver = false;

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


        this.anims.create({
            key: 'explosion_start',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 4 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'explosion_loop',
            frames: this.anims.generateFrameNumbers('explosion', { start: 5, end: 15 }),
            frameRate: 12,
            repeat: -1
        });
        
        this.anims.create({ 
            key: 'laser_start', 
            frames: this.anims.generateFrameNumbers('laser', { start: 0, end: 2 }), 
            frameRate: 10, 
            repeat: 0 
        });

        this.anims.create({ 
            key: 'laser_loop', 
            frames: this.anims.generateFrameNumbers('laser', { start: 3, end: 6 }), 
            frameRate: 10, 
            repeat: -1 
        });

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

        this.time.addEvent({
            delay: 4000,
            callback: this.spawnDamageZone,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 2000,
            callback: this.spawnDustStorm,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 3000,
            callback: this.spawnLaser,
            callbackScope: this,
            loop: true
        });
        
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
        const CARS = ['taxi_car', 'red_car'];
        for (let i = 0; i < count; i++) {
            console.log("Cat");
            const x = Phaser.Math.Between(400, this.worldWidth - 100);
            const y = Phaser.Math.Between(400, this.worldHeight - 100);

            const randomCar = Phaser.Utils.Array.GetRandom(CARS);
            const ENEMY = this.add.sprite(x, y, randomCar);
            ENEMY.setOrigin(0.5, 0.5);
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

    spawnDamageZone(){
        const X = Phaser.Math.Between(150, this.worldWidth - 150);
        const Y = Phaser.Math.Between(150, this.worldHeight - 150);
        const RADIUS = 60;

        const WARNING = this.add.circle(X, Y, RADIUS, 0xff0000, 0.25);

        WARNING.setStrokeStyle(2, 0xff0000, 0.8);

        this.tweens.add({
            targets: WARNING,
            alpha: {from: 0.25, to: 0.5},
            duration: 300,
            yoyo: true,
            repeat: 4
        });

        this.time.delayedCall(1500, () => {
            WARNING.destroy()
            const AOE = this.add.sprite(X, Y, 'explosion');
            this.physics.add.existing(AOE, true);
            AOE.body.setCircle(100);

            AOE.anims.play('explosion_start');

            this.time.delayedCall(400, () => {
                if (AOE && AOE.active) {
                    AOE.anims.play('explosion_loop');
                }
            });

            const OVERLAP_CHECK = this.physics.add.overlap(
                this.player,
                AOE,
                () => {
                    this.hitByEnemy();
                },
                null,
                this
            );

            this.time.delayedCall(3000, () => {
                AOE.destroy();
                this.physics.world.removeCollider(OVERLAP_CHECK);
            });
        });
    }

    spawnDustStorm() {
        if (this.gameOver) return;

        const X = Phaser.Math.Between(200, this.worldWidth - 200);
        const Y = Phaser.Math.Between(200, this.worldHeight - 200);
        const W = 160;
        const H = 100;

        const dustZone = this.add.rectangle(X, Y, W, H, 0Xc2a878, 0.5);
        dustZone.setStrokeStyle(2, 0x8a7350, 0.6);

        this.tweens.add({
            targets: dustZone,
            alpha: { from: 0.4, to: 0.6 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.physics.add.existing(dustZone, false);
        dustZone.body.setAllowGravity(false);

        const driftAngle = Phaser.Math.Between(0, 360);
        const driftSpeed = 30;
        const vx = Math.cos(Phaser.Math.DegToRad(driftAngle)) * driftSpeed;
        const vy = Math.sin(Phaser.Math.DegToRad(driftAngle)) * driftSpeed;
        dustZone.body.setVelocity(vx, vy);
        dustZone.body.setCollideWorldBounds(true);
        dustZone.body.setBounce(1);

        this.physics.add.overlap(
        this.player,
        dustZone,
        () => {
            this.triggerLowVisibility();
        },
        null,
        this
        );

        this.time.delayedCall(12000, () => {
            dustZone.destroy();
        });
    }
    
    triggerLowVisibility() {
        if (this.lowVisibilityActive) return;
        this.lowVisibilityActive = true;

        const FOG = this.add.rectangle(400, 300, 800, 600, 0x4a3f30)
        .setAlpha(1)
        .setScrollFactor(0)
        .setDepth(1000);

        this.tweens.add({
            targets: FOG,
            alpha: 0.75,
            duration: 200,
            yoyo: true,
            hold: 1600,
            onComplete: () => {
                FOG.destroy();
                this.lowVisibilityActive = false;
            }
        });
    }

    spawnLaser() {
        if (this.gameOver) return;

        const laserY = Phaser.Math.Between(200, this.worldHeight - 200);
        
        
        const indicator = this.add.line(0, 0, 0, laserY, this.worldWidth, laserY, 0xff0000, 0.4);
        indicator.setOrigin(0, 0);
        indicator.setLineWidth(2);

      
        this.tweens.add({
            targets: indicator,
            alpha: { from: 0.4, to: 0.9 },
            duration: 200,
            yoyo: true,
            repeat: 2
        });
        this.time.delayedCall(1000, () => {
            indicator.destroy();

            const LASER = this.add.sprite(this.worldWidth / 2, laserY, 'laser');
            LASER.setDisplaySize(this.worldWidth, LASER.height);
            this.physics.add.existing(LASER, true);
            LASER.anims.play('laser_start');
            this.time.delayedCall(300, () => {
                if (LASER && LASER.active) {
                    LASER.anims.play('laser_loop');
                }
            });

            const laserOverlap = this.physics.add.overlap(
                this.player,
                LASER,
                () => {
                    this.hitByEnemy();
                },
                null,
                this
            );

            this.time.delayedCall(2000, () => {
                LASER.destroy();
                this.physics.world.removeCollider(laserOverlap);
            });
        });
    }
}