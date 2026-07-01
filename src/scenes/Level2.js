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

        this.shieldWidth = 80;
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
        this.cat.body.setCircle(20);
        
        this.shield = this.add.rectangle(
            CX, CY - 70,
            this.shieldWidth, this.shieldHeight,
            0x66ccff, 0.9
        );

        this.shield.setStrokeStyle(2, 0xffffff, 1);
        this.physics.add.existing(this.shield, false);
        this.shield.body.setImmovable(true);

    }
    update(){
        const POINTER = this.input.activePointer;
    }
}