class Preload extends Phaser.Scene {
    constructor() { super({ key: 'Preload' }); }
    preload() {
        this.load.spritesheet('cat_walk_down', 'src/assets/walk_down.png', {frameWidth: 32, frameHeight: 32});
    }
    create(){
        this.scene.start('Level1');
    }
}