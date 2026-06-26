class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
    }
    create(){
        this.add.rectangle(400, 300, 800, 600, 0x2d4a22);

        this.player = this.add.rectangle(400, 300, 32, 32, 0xff69b4);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            }
        );
        
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