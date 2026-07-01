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
        this.cat = this.physics.add.staticSprite(
            this.scale.width / 2, 
            this.scale.height / 2, 
            random
        );
        this.shield = this.add.rectangle(0, 0, 50, 14, 0x66ccff);

    }
    update(){
        const POINTER = this.input.activePointer;
    }
}