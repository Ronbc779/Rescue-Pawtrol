class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
    }
    create(){
        this.add.rectangle(400, 300, 800, 600, 0x2d4a22);

        this.player = this.physics.add.rectangle(400, 300, 32, 32, 0xff69b4);
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
    }
    update() {
        const SPEED = 160;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown) this.player.body.setVelocity(-SPEED);
        if (this.cursors.right.isDown) this.player.body.setVelocity(SPEED);
        if (this.cursors.up.isDown) this.player.body.setVelocity(-SPEED);
        if (this.cursors.down.isDown) this.player.body.setVelocity(SPEED);
    }
}