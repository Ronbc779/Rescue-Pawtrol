class Tutorial extends Phaser.Scene {
    constructor() {
        super({ key: 'Tutorial' });
    }

    init(data) {
        this.level = data.level;
    }

    create() {
        const content = {
            Level1: {
                title: 'LEVEL 1: EXPLORE & RESCUE',
                lines: [
                    '-  WASD or Arrow Keys to move your cat',
                    '-  Walk into a cat to pick it up',
                    '-  Bring cats to the Shelter, spend Love on upgrades',
                    '-  Avoid cars and hazards',
                    '-  Buy WIN once you have enough Love'
                ]
            },
            Level2: {
                title: 'LEVEL 2: DEFEND THE CAT',
                lines: [
                    '-  Move mouse to aim the shield',
                    '-  Block bullets, rocks, nets',
                    '-  Let medkits through. 10 needed to win',
                    '-  One bad hit reaching the cat = game over'
                ]
            },
        };

        const data = content[this.level];

        this.add.rectangle(400, 300, 800, 600, 0x1a2f1a);
        this.add.text(400, 50, data.title, {
            fontSize: '28px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5);

        let y = 130;
        data.lines.forEach(line => {
            this.add.text(60, y, line, { fontSize: '16px', color: '#ffffff' });
            y += 42;
        });

        const btn = this.add.rectangle(400, 500, 220, 55, 0x4caf50, 1).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0xffffff, 1);
        this.add.text(400, 500, 'START', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        btn.on('pointerdown', () => this.scene.start(this.level));
    }
}