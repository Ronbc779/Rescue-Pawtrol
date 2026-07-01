class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
    }
    init() {
        this.waveIndex = 0;
        this.waveDurations = [30, 45, 60];
        this.waveSpawnDelays = [1200, 800, 500];
        this.waveSpeeds = [180, 260, 360];

        this.catHP = 1;
        this.maxCatHP = 1;

        this.shieldWidth = 50;
        this.shieldHeight = 16;

        this.waveTimerReduction = 0;

        this.gameOver = false;
        this.inShop = false;
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
        this.cat.setScale(3);
        this.cat.body.setCircle(60);
        this.cat.refreshBody();
        
        this.shield = this.add.rectangle(
            CX, CY - 70,
            this.shieldWidth, this.shieldHeight,
            0x66ccff, 0.9
        );

        this.shield.setStrokeStyle(2, 0xffffff, 1);
        this.physics.add.existing(this.shield, true);

        this.cameras.main.setZoom(1.2);
        this.cameras.main.centerOn(400, 300);

    }
    update() {
        if (this.gameOver || this.inShop) return;

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
}