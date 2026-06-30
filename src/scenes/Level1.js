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

        this.shelterCapacity = 0;
        this.shelterCapacityMax = 5;
        this.shelterLevel = 1;
        this.love = 0;

        this.canCarryTwo = false;
        this.speedBoostBought = false; 
        this.zoomBought = false;

        this.shieldActive = false;
        this.enemiesSlowed = false;
        this.revealActive = false;


        this.createUpgradePanel();

        
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
        this.spawnCats(5);
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

        this.damageZoneTimer = this.time.addEvent({
            delay: 4000,
            callback: this.spawnDamageZone,
            callbackScope: this,
            loop: true
        });

        this.dustStormTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnDustStorm,
            callbackScope: this,
            loop: true
        });

        this.laserTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnLaser,
            callbackScope: this,
            loop: true
        });
        
    }
    update() {
        if (this.gameOver) return;
        const SPEED = this.speedBoostBought ? 190 : 160;
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
            cat.setDepth(1);
            this.physics.add.existing(cat, true);
            this.catsToRescue.add(cat);

        }
    }

    pickUpCat(player, cat) {
        if  (this.carriedCat) return;

        cat.setActive(false).setVisible(false);
        cat.destroy();
        this.carriedCat = this.add.rectangle(0, 0, 18, 18, 0xffdd57);
    }

    dropOffCat(player, safeZone) {
        if(!this.carriedCat) return;
        this.carriedCat.destroy();
        this.carriedCat = null;
        this.player.rescuedCats++;
        this.fillShelterCapacity();
    }

    spawnEnemies(count) {
        const CARS = ['taxi_car', 'red_car'];
        for (let i = 0; i < count; i++) {
            console.log("Cat");
            const x = Phaser.Math.Between(400, this.worldWidth - 100);
            const y = Phaser.Math.Between(400, this.worldHeight - 100);

            const randomCar = Phaser.Utils.Array.GetRandom(CARS);
            const ENEMY = this.add.sprite(x, y, randomCar);
            ENEMY.setDepth(1);
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
        if (this.shieldActive) return;
        if (this.gameOver) return;
        this.gameOver = true;

        this.player.body.setVelocity(0);
        this.player.anims.stop();

        if (this.damageZoneTimer) this.damageZoneTimer.remove();
        if (this.dustStormTimer) this.dustStormTimer.remove();
        if (this.laserTimer) this.laserTimer.remove();
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
        const SPEEDMULT = this.enemiesSlowed ? 0.4 : 1;

        this.enemies.getChildren().forEach(ENEMY => {
            const DIRECTIONS = [
                { vx: 80 * SPEEDMULT, vy: 0, angle: 90, horizontal: true },
                { vx: -80 * SPEEDMULT, vy: 0, angle: -90, horizontal: true },
                { vx: 0, vy: 80 * SPEEDMULT, angle: 180, horizontal: false },
                { vx: 0, vy: -80 * SPEEDMULT, angle: 0, horizontal: false }
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
        const RADIUS = 100;

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
            AOE.body.setCircle(RADIUS);

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

            LASER.body.setSize(LASER.width, LASER.height);
            LASER.body.updateFromGameObject();
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

    fillShelterCapacity() {
        this.shelterCapacity++;

        if (this.shelterCapacity >= this.shelterCapacityMax) {
            this.levelUpShelter();
        }

        this.updateUpgradeUI();
        }

        levelUpShelter() {
        this.shelterCapacity = 0;
        this.shelterLevel++;
        this.shelterCapacityMax += 3;

        const loveEarned = 10 + (this.shelterLevel - 2) * 5;
        this.love += loveEarned;

        this.showLevelUpPopup(loveEarned);
        this.spawnCats(this.shelterCapacityMax);
        }

        showLevelUpPopup(amount) {
        const popup = this.add.text(this.player.x, this.player.y - 50, `Animal Shelter Level Up! +${amount}`, {
            fontSize: '16px', color: '#ff66aa', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(105);

        this.tweens.add({
            targets: popup,
            y: popup.y - 30,
            alpha: 0,
            duration: 1200,
            onComplete: () => popup.destroy()
        });
    }

    createUpgradePanel() {
        const panelX = 800 - 160;
        let panelY = 100;

        this.upgradeButtons = {};
        this.upgradePanelVisible = true;
        this.upgradePanelContainer = this.add.container(0, 0);
        this.upgradePanelContainer.setDepth(100);


        panelY += 30;
        this.upgradeButtons.speed = this.makeUpgradeButton(panelX, panelY, 'Speed +30', 10, () => this.buySpeedBoost());
        panelY += 45;
        this.upgradeButtons.carry = this.makeUpgradeButton(panelX, panelY, 'Carry 2', 25, () => this.buyCarryTwo());
        panelY += 45;
        this.upgradeButtons.zoom = this.makeUpgradeButton(panelX, panelY, 'Zoom Out', 20, () => this.buyZoomOut());
        panelY += 55;

        this.upgradeButtons.shield = this.makeUpgradeButton(panelX, panelY, 'Shield 5s', 10, () => this.activateShield());
        panelY += 45;
        this.upgradeButtons.slow = this.makeUpgradeButton(panelX, panelY, 'Slow Enemies', 10, () => this.activateSlowEnemies());
        panelY += 45;
        this.upgradeButtons.reveal = this.makeUpgradeButton(panelX, panelY, 'Reveal Cats', 8, () => this.activateReveal());
        panelY += 45;
        this.upgradeButtons.win = this.makeUpgradeButton(panelX, panelY, 'WIN', 50, () => this.buyWin());

        Object.values(this.upgradeButtons).forEach(b => {
            this.upgradePanelContainer.add([b.BTN, b.TEXT]);
        });

        this.loveText = this.add.text(800 - 160, 60, `💗 Love: 0`, {
            fontSize: '16px', color: '#ff66aa', fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(100);

        this.shelterLevelText = this.add.text(800 - 160, 80, `Shelter Lv.1 — 0/5`, {
            fontSize: '13px', color: '#ffffff'
        }).setScrollFactor(0).setDepth(100);

        this.toggleBtn = this.add.rectangle(800 - 30, 30, 50, 40, 0x333333, 0.95)
            .setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true });
        this.toggleBtn.setStrokeStyle(2, 0xffffff, 1);

        this.toggleText = this.add.text(800 - 30, 30, '☰', {
            fontSize: '22px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

        this.toggleBtn.on('pointerdown', () => this.toggleUpgradePanel());
    }

    makeUpgradeButton(x, y, label, cost, onClick) {
        const BTN = this.add.rectangle(x, y, 150, 38, 0x4caf50, 0.9)
            .setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });
        BTN.setStrokeStyle(2, 0xffffff, 1);

        const TEXT = this.add.text(x, y, `${label}\n(${cost} 💗)`, {
            fontSize: '11px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        BTN.on('pointerdown', () => {
            console.log('Button clicked:', label);
            onClick()
        });
        BTN.on('pointerover', () => BTN.setFillStyle(0x66bb6a, 0.9));
        BTN.on('pointerout', () => BTN.setFillStyle(0x4caf50, 0.9));

        return { BTN, TEXT, cost };
    }


    updateUpgradeUI() {
        this.loveText.setText(`💗 Love: ${this.love}`);
        this.shelterLevelText.setText(`Shelter Lv.${this.shelterLevel} — ${this.shelterCapacity}/${this.shelterCapacityMax}`);
    }

    buySpeedBoost() {
        if (this.speedBoostBought) return;
        if (this.love < 15) return;

        this.love -= 15;
        this.speedBoostBought = true;
        this.updateUpgradeUI();
        this.upgradeButtons.speed.BTN.setFillStyle(0x888888, 0.9);
    }

    buyCarryTwo() {
        if (this.canCarryTwo) return;
        if (this.love < 25) return;

        this.love -= 25;
        this.canCarryTwo = true;
        this.updateUpgradeUI();
        this.upgradeButtons.carry.BTN.setFillStyle(0x888888, 0.9);
    }

    buyZoomOut() {
        if (this.zoomBought) return;
        if (this.love < 20) return;

        this.love -= 20;
        this.zoomBought = true;
        this.cameras.main.setZoom(1.0);
        this.updateUpgradeUI();
        this.upgradeButtons.zoom.BTN.setFillStyle(0x888888, 0.9);
    }

    activateShield() {
        if (this.shieldActive) return;
        if (this.love < 10) return;

        this.love -= 10;
        this.shieldActive = true;
        this.updateUpgradeUI();

        this.player.setTint(0x66ccff);
        this.time.delayedCall(5000, () => {
            this.shieldActive = false;
            this.player.clearTint();
        });
    }

        activateSlowEnemies() {
        if (this.enemiesSlowed) return;
        if (this.love < 10) return;

        this.love -= 10;
        this.enemiesSlowed = true;
        this.updateUpgradeUI();

        this.time.delayedCall(8000, () => {
            this.enemiesSlowed = false;
        });
    }

    activateReveal() {
        if (this.revealActive) return;
        if (this.love < 8) return;

        this.love -= 8;
        this.revealActive = true;
        this.updateUpgradeUI();

        this.catsToRescue.getChildren().forEach(cat => {
            if (!cat.active) return;
            const ring = this.add.circle(cat.x, cat.y, 22, 0xffff00, 0).setStrokeStyle(2, 0xffff00, 0.8);
            cat.revealRing = ring;
        });

        this.time.delayedCall(6000, () => {
            this.revealActive = false;
            this.catsToRescue.getChildren().forEach(cat => {
            if (cat.revealRing) {
                cat.revealRing.destroy();
                cat.revealRing = null;
            }
            });
        });
    }

    buyWin() {
        if (this.gameOver) return;
        if (this.love < 0) return;

        this.love -= 0;
        this.updateUpgradeUI();
        this.win();
    }

    win() { 
        this.gameOver = true;

        this.player.body.setVelocity(0);
        this.player.anims.stop();
        this.upgradePanelContainer.destroy();

        if (this.damageZoneTimer) this.damageZoneTimer.remove();
        if (this.dustStormTimer) this.dustStormTimer.remove();
        if (this.laserTimer) this.laserTimer.remove();
        this.enemies.getChildren().forEach(ENEMY => {
            ENEMY.body.setVelocity(0);
        });

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(20);

        this.add.text(400, 220, 'YOU WIN!', {
            fontSize: '48px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.add.text(400, 275, `Rescued ${this.player.rescuedCats} cats`, {
            fontSize: '24px', color: '#00ff99'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.add.text(400, 320, 'Stray animals, not just cats, need homes too!\nVisit your local shelter', {
            fontSize: '14px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        const continueBtn = this.add.rectangle(400, 390, 220, 50, 0x2196f3, 1)
            .setScrollFactor(0).setDepth(21).setInteractive({ useHandCursor: true });
        continueBtn.setStrokeStyle(3, 0xffffff, 1);

        this.add.text(400, 390, 'Proceed', {
            fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

        continueBtn.on('pointerdown', () => this.goToLevel2());
        continueBtn.on('pointerover', () => continueBtn.setFillStyle(0x42a5f5, 1));
        continueBtn.on('pointerout', () => continueBtn.setFillStyle(0x2196f3, 1));

        this.add.text(400, 450, 'Or press R to replay this level', {
            fontSize: '13px', color: '#aaaaaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        this.input.keyboard.once('keydown-R', () => {
            this.gameOver = false;
            this.scene.restart();
        });
    }

    toggleUpgradePanel() {
        this.upgradePanelVisible = !this.upgradePanelVisible;
        this.upgradePanelContainer.setVisible(this.upgradePanelVisible);
        this.loveText.setVisible(this.upgradePanelVisible);
        this.shelterLevelText.setVisible(this.upgradePanelVisible);
        this.toggleText.setText(this.upgradePanelVisible ? '☰' : '＋');
    }
    
        goToLevel2() {
        this.scene.start('Level2');
    }
}