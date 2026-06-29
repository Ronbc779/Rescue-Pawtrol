class Preload extends Phaser.Scene {
    constructor() { super({ key: 'Preload' }); }
    preload() {
        this.load.spritesheet('cat_walk_down', 'src/assets/walk_down.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('cat_walk_up', 'src/assets/walk_up.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cat_walk_left', 'src/assets/walk_left.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cat_walk_right', 'src/assets/walk_right.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cat_walk_up_left', 'src/assets/walk_up_left.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cat_walk_up_right', 'src/assets/walk_up_right.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cat_walk_down_left', 'src/assets/walk_down_left.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('cat_walk_down_right', 'src/assets/walk_down_right.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('laser', 'src/assets/LaserShot.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('explosion', 'src/assets/smoke_explosion.png', { frameWidth: 200, frameHeight: 200 });

        this.load.image('rescue_center', 'src/assets/rescue_center.png');
        this.load.image('red_car', 'src/assets/red_car.png');
        this.load.image('taxi_car', 'src/assets/taxi_car.png');
    }
    create(){
        this.scene.start('Level1');
    }
}