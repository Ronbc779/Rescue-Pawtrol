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
        this.cameras.main.setZoom(1.5);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        
    }
    update() {
        const SPEED = 160;
        this.player.body.setVelocityX(0);
        this.player.body.setVelocityY(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown){ 
            this.player.body.setVelocityX(-SPEED);
        }
        else if (this.cursors.right.isDown || this.wasd.right.isDown){
            this.player.body.setVelocityX(SPEED);
        } 
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.body.setVelocityY(-SPEED);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.body.setVelocityY(SPEED);
        }
    }
}