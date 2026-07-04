class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
    }
    init() {
        this.waveIndex = 0;
        this.waveDurations = [20, 30, 45];
        this.waveSpawnDelays = [1200, 900, 600];
        this.waveSpeeds = [180, 230, 300];

        this.catHP = 1;
        this.maxCatHP = 1;

        this.shieldWidth = 60;
        this.shieldHeight = 16;

        this.waveTimerReduction = 0;

        this.gameOver = false;
        this.inUpgrades = false;
        this.currentDirection = 'up';
    }
    create(){
        const CATS = ["white_cat1", "white_cat2", "gray_cat1", "gray_cat2", "orange_cat1", "orange_cat2"]
        const random = Phaser.Utils.Array.GetRandom(CATS);
        const CX = this.scale.width / 2;
        const CY = this.scale.height / 2;
        this.cat = this.physics.add.staticSprite(
            CX, 
            CY, 
            random
        );
        this.cat.setScale(5);
        this.cat.body.setCircle(75);
        this.cat.refreshBody();
        
        this.shield = this.add.rectangle(
            CX, CY - 70,
            this.shieldWidth, this.shieldHeight,
            0x66ccff, 0.9
        );

        this.shield.setStrokeStyle(2, 0xffffff, 1);
        this.physics.add.existing(this.shield, true);

        this.hpText = this.add.text(20, 20, `HP: ${this.catHP}`, {
            fontSize: '20px', color: '#ff6666', fontStyle: 'bold'
        }).setDepth(10);

        this.waveText = this.add.text(400, 20, `Wave 1 / 3`, {
            fontSize: '20px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5, 0).setDepth(10);

        this.timerText = this.add.text(700, 20, `20s`, {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(1, 0).setDepth(10);

        this.add.text(400, 570, 'Move mouse to aim shield', {
            fontSize: '14px', color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(10);

        this.badProjectiles = this.physics.add.group();

        this.physics.add.collider(this.badProjectiles, this.shield, this.onShieldBlock, null, this);
        this.physics.add.overlap(this.badProjectiles, this.cat, this.onHit, null, this);

        this.startWave();

    }
    update() {
        if (this.gameOver || this.inUpgrades) return;

        const pointer = this.input.activePointer;
        const CX = this.scale.width / 2;
        const CY = this.scale.height / 2;
        const DX = pointer.x - CX;
        const DY = pointer.y - CY;
        const angle = Math.atan2(DY, DX);
        const deg = Phaser.Math.RadToDeg(angle);

        const prevDir = this.currentDirection;

        if (deg >= -65 && deg < 65) {
            this.currentDirection = 'right';
        } else if (deg >= 65 && deg < 115) {
            this.currentDirection = 'down';
        } else if (deg >= 115 || deg < -115) {
            this.currentDirection = 'left';
        } else {
            this.currentDirection = 'up';
        }

        this.positionShield(pointer.x, pointer.y);
    }

    positionShield(mouseX, mouseY) {
        const RADIUS = 80;
        const CX = this.scale.width / 2;
        const CY = this.scale.height / 2;
        const SW = this.shieldWidth;
        const SH = this.shieldHeight;

        const SLIDE_RANGE = 80;

        let shieldX, shieldY;

        switch (this.currentDirection) {
            case 'up':
                shieldX = Phaser.Math.Clamp(mouseX, CX - SLIDE_RANGE, CX + SLIDE_RANGE);
                shieldY = CY - RADIUS;
                this.shield.setPosition(shieldX, shieldY);
                this.shield.setSize(SW, SH);
                this.shield.body.setSize(SW, SH);
                this.shield.body.reset(shieldX, shieldY);
                break;
            case 'down':
                shieldX = Phaser.Math.Clamp(mouseX, CX - SLIDE_RANGE, CX + SLIDE_RANGE);
                shieldY = CY + RADIUS;
                this.shield.setPosition(shieldX, shieldY);
                this.shield.setSize(SW, SH);
                this.shield.body.setSize(SW, SH);
                this.shield.body.reset(shieldX, shieldY);
                break;
            case 'left':
                shieldX = CX - RADIUS;
                shieldY = Phaser.Math.Clamp(mouseY, CY - SLIDE_RANGE, CY + SLIDE_RANGE);
                this.shield.setPosition(shieldX, shieldY);
                this.shield.setSize(SH, SW);
                this.shield.body.setSize(SH, SW);
                this.shield.body.reset(shieldX, shieldY);
                break;
            case 'right':
                shieldX = CX + RADIUS;
                shieldY = Phaser.Math.Clamp(mouseY, CY - SLIDE_RANGE, CY + SLIDE_RANGE);
                this.shield.setPosition(shieldX, shieldY);
                this.shield.setSize(SH, SW);
                this.shield.body.setSize(SH, SW);
                this.shield.body.reset(shieldX, shieldY);
                break;
        }
    }

    getCardinalSpawnPoint() {
        const dirs = ['up', 'down', 'left', 'right'];
        const dir = Phaser.Utils.Array.GetRandom(dirs);
        let x, y, vx, vy;
        const SPEED = this.waveSpeeds[this.waveIndex];
        const OFFSET = Phaser.Math.Between(-100, 100);

        switch (dir) {
            case 'up':    x = this.scale.width/2 + OFFSET;  y = -20;  vx = 0;      vy = SPEED;  break;
            case 'down':  x = this.scale.width/2 + OFFSET;  y = 620;  vx = 0;      vy = -SPEED; break;
            case 'left':  x = -20;  y = this.scale.height/2 + OFFSET; vx = SPEED;  vy = 0;      break;
            case 'right': x = 820;  y = this.scale.height/2 + OFFSET; vx = -SPEED; vy = 0;      break;
        }
        return { x, y, vx, vy, dir };
    }

    spawnBadProjectile() {
        const { x, y, vx, vy } = this.getCardinalSpawnPoint();

        const types = ['bullet', 'rock', 'net'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const size = 32;

        let proj;

        if (type === 'rock')     {
            const rockTextures = ['moss_rock', 'sand_rock', 'blue_rock', 'gray_rock'];
            const chosenTexture = Phaser.Utils.Array.GetRandom(rockTextures);

            proj = this.add.sprite(x, y, chosenTexture);
            const visualScale = 0.2;
            proj.setScale(visualScale);

            this.physics.add.existing(proj);
            const scaledSize = 256 * visualScale;
            const radius = scaledSize / 2;
            proj.body.setSize(scaledSize, scaledSize);
            const offset = (256 - scaledSize) / 2;
            proj.body.setOffset(offset, offset);
        }
        else{
            let color, size;
            if (type === 'bullet')  { color = 0x8a7350; size = 10; }
            else  { color = 0x66ff99; size = 18; }

            proj = this.add.circle(x, y, size, color);
            proj.setStrokeStyle(2, 0x000000, 0.5);
            
            this.physics.add.existing(proj);
            proj.body.setCircle(size);
            
        }
        proj.hazardType = type;
        this.badProjectiles.add(proj);
        proj.body.setVelocity(vx, vy);

        this.time.delayedCall(6000, () => {
            if (proj.active) proj.destroy();
        });
    }

    onShieldBlock(shield, proj) {
        this.flashShield(0xffffff);
        proj.destroy();
    }

    flashShield(color = 0xffffff) {
        this.shield.setFillStyle(color, 1);
        this.time.delayedCall(120, () => {
            if (this.shield.active) {
                this.shield.setFillStyle(0x66ccff, 0.9);
            }
        });
    }

    onHit(cat, proj) {
        if (this.gameOver) return;
        proj.destroy();
        this.catHP--;
        this.hpText.setText(`HP: ${this.catHP}`);

        this.cat.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            if (this.cat.active) this.cat.clearTint();
        });

        if (this.catHP <= 0) {
            this.loseGame();
        }
    }

    startWave() {
        const waveNum = this.waveIndex;
        let duration = this.waveDurations[waveNum] - this.waveTimerReduction;
        duration = Math.max(10, duration);
        this.timeRemaining = duration;

        this.waveText.setText(`Wave ${waveNum + 1} / 3`);
        this.timerText.setText(`${this.timeRemaining}s`);

        this.waveCountdown = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.gameOver || this.inUpgrades) return;
                this.timeRemaining--;
                this.timerText.setText(`${this.timeRemaining}s`);

                if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#ff3333');
                } else {
                    this.timerText.setColor('#ffffff');
                }

                if (this.timeRemaining <= 0) {
                    this.endWave();
                }
            }
        });

        this.spawnTimer = this.time.addEvent({
            delay: this.waveSpawnDelays[waveNum],
            loop: true,
            callback: () => {
                if (this.gameOver || this.inUpgrades) return;
                this.spawnBadProjectile();
            }
        });
    }

    endWave() {
        this.waveCountdown.remove();
        this.spawnTimer.remove();
        this.badProjectiles.clear(true, true);

        if (this.waveIndex >= 2) {
            this.winGame();
        } else {
            this.waveIndex++;
            this.showUpgrades();
        }
    }

    showUpgrades() {
        this.inUpgrades = true;

        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(30);

        this.add.text(400, 120, `Wave ${this.waveIndex} Complete!`, {
            fontSize: '32px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(31);

        this.add.text(400, 170, 'Choose ONE free upgrade:', {
            fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(31);

        const upgrades = [
            {
                label: 'Bigger Shield',
                desc: 'Shield width +30',
                action: () => {
                    this.shieldWidth += 30;
                    this.closeUpgrades();
                }
            },
            {
                label: 'Extra Health',
                desc: '+1 max HP, restores 1 HP',
                action: () => {
                    this.maxCatHP++;
                    this.catHP = Math.min(this.catHP + 1, this.maxCatHP);
                    this.hpText.setText(`HP: ${this.catHP}`);
                    this.closeUpgrades();
                }
            },
            {
                label: '⏩ Faster Timer',
                desc: `-10 seconds from Wave ${this.waveIndex + 1}`,
                action: () => {
                    this.waveTimerReduction += 10;
                    this.closeUpgrades();
                }
            }
        ];

        this.upgradesObjects = [overlay];

        upgrades.forEach((upgrade, i) => {
            const btnY = 260 + i * 100;

            const btn = this.add.rectangle(400, btnY, 320, 75, 0x4caf50, 1)
                .setDepth(31).setInteractive({ useHandCursor: true });
            btn.setStrokeStyle(3, 0xffffff, 1);

            const labelText = this.add.text(400, btnY - 12, upgrade.label, {
                fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(32);

            const descText = this.add.text(400, btnY + 14, upgrade.desc, {
                fontSize: '13px', color: '#ccffcc'
            }).setOrigin(0.5).setDepth(32);

            btn.on('pointerover', () => btn.setFillStyle(0x66bb6a, 1));
            btn.on('pointerout', () => btn.setFillStyle(0x4caf50, 1));
            btn.on('pointerdown', upgrade.action);

            this.upgradesObjects.push(btn, labelText, descText);
        });
    }

    closeUpgrades() {
        this.upgradesObjects.forEach(obj => obj.destroy());
        this.upgradesObjects = [];
        this.inUpgrades = false;
        this.startWave();
    }

    winGame() {
        this.gameOver = true;

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(40);

        this.add.text(400, 200, 'CAT SAVED!', {
            fontSize: '42px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(41);

        this.add.text(400, 265, 'You protected the cat through all 3 waves!', {
            fontSize: '16px', color: '#00ff99'
        }).setOrigin(0.5).setDepth(41);

        this.add.text(400, 330, 'They deserve to be protected as well.', {
            fontSize: '8px', color: '#00ff99'
        }).setOrigin(0.5).setDepth(41);

        const continueBtn = this.add.rectangle(400, 350, 240, 55, 0x2196f3, 1)
            .setDepth(41).setInteractive({ useHandCursor: true });
        continueBtn.setStrokeStyle(3, 0xffffff, 1);

        this.add.text(400, 350, 'Proceed', {
            fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(42);

        continueBtn.on('pointerdown', () => this.scene.start('Tutorial', { level: 'Level3' }));
        continueBtn.on('pointerover', () => continueBtn.setFillStyle(0x42a5f5, 1));
        continueBtn.on('pointerout', () => continueBtn.setFillStyle(0x2196f3, 1));

        this.add.text(400, 420, 'Press R to try again', {
            fontSize: '14px', color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(41);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }

    loseGame() {
        this.gameOver = true;

        this.badProjectiles.clear(true, true);
        if (this.waveCountdown) this.waveCountdown.remove();
        if (this.spawnTimer) this.spawnTimer.remove();

        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(40);

        this.add.text(400, 220, 'GAME OVER', {
            fontSize: '42px', color: '#ff3333', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(41);

        this.add.text(400, 280, `Reached Wave ${this.waveIndex + 1}`, {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(41);

        this.add.text(400, 340, 'Press R to try again', {
            fontSize: '18px', color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(41);

        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
    }
}