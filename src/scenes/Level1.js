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

        this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('cat_walk_up', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('cat_walk_down', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_left', frames: this.anims.generateFrameNumbers('cat_walk_left', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('cat_walk_right', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_up_left', frames: this.anims.generateFrameNumbers('cat_walk_up_left', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_up_right', frames: this.anims.generateFrameNumbers('cat_walk_up_right', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_down_left', frames: this.anims.generateFrameNumbers('cat_walk_down_left', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_down_right', frames: this.anims.generateFrameNumbers('cat_walk_down_right', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });

        this.spawnCats(5);
        
    }
    update() {
        const SPEED = 160;
        const BODY = this.player.body
        BODY.setVelocity(0);

        const LEFT  = this.cursors.left.isDown  || this.wasd.left.isDown;
        const RIGHT = this.cursors.right.isDown || this.wasd.right.isDown;
        const UP    = this.cursors.up.isDown    || this.wasd.up.isDown;
        const DOWN  = this.cursors.down.isDown  || this.wasd.down.isDown;

        let moving = false;

        if (UP && LEFT) {
            BODY.setVelocity(-SPEED, -SPEED);
            this.player.anims.play('walk_up_left', true);
            moving = true;
        } else if (UP && RIGHT) {
            BODY.setVelocity(SPEED, -SPEED);
            this.player.anims.play('walk_up_right', true);
            moving = true;
        } else if (DOWN && LEFT) {
            BODY.setVelocity(-SPEED, SPEED);
            this.player.anims.play('walk_down_left', true);
            moving = true;
        } else if (DOWN && RIGHT) {
            BODY.setVelocity(SPEED, SPEED);
            this.player.anims.play('walk_down_right', true);
            moving = true;
        } else if (LEFT) {
            BODY.setVelocityX(-SPEED);
            this.player.anims.play('walk_left', true);
            moving = true;
        } else if (RIGHT) {
            BODY.setVelocityX(SPEED);
            this.player.anims.play('walk_right', true);
            moving = true;
        } else if (UP) {
            BODY.setVelocityY(-SPEED);
            this.player.anims.play('walk_up', true);
            moving = true;
        } else if (DOWN) {
            BODY.setVelocityY(SPEED);
            this.player.anims.play('walk_down', true);
            moving = true;
        }

        if (!moving) {
            this.player.anims.stop();
        }

        BODY.velocity.normalize().scale(SPEED);

        if (this.carriedCat) {
            this.carriedCat.setPosition(this.player.x + 20, this.player.y -10);
        }
    }

    spawnCats() {
        this.catsToRescue = this.physics.add.staticGroup();
        for (let i = 0; i < CountQueuingStrategy; i++) {
            const x = Phaser.Math.Between(200, this.worldWidth - 200);
            const y = Phaser.Math.Between(200, this.worldHeight - 200);
            const cat = this.add.rectangle(x, y, 24, 24, 0xffd57);
            this.physices.add.existing(cat, true);
            this.catsToRescue.add(cat);

        }
    }

    pickUpCat(player, cat){
        if  (this.carriedCat) {
            cat.setActive(false);
            cat.body.enablle(false);
            this.carriedCat = this.add.rectangle(0, 0, 18, 18, 0xffdd57);
        }
    }
}