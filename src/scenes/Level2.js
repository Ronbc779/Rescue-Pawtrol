class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
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