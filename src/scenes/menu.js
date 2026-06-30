class Menu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x1a2f1a);

        this.add.text(400, 150, '🐾Rescue Pawtrol🐾', {
            fontSize: '42px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 200, 'Save the cats. Avoid the danger.', {
            fontSize: '16px', color: '#cccccc'
        }).setOrigin(0.5);

        this.createButton(400, 320, 'PLAY', () => {
            this.exitGame();
        });

        this.createButton(400, 400, 'EXIT', () => {
            this.exitGame();
        });
    }

    createButton(x, y, label, onClick) {
        const btn = this.add.rectangle(x, y, 220, 60, 0x4caf50, 1);
        btn.setStrokeStyle(3, 0xffffff, 1);
        btn.setInteractive({ useHandCursor: true });

        this.add.text(x, y, label, {
            fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x66bb6a, 1));
        btn.on('pointerout', () => btn.setFillStyle(0x4caf50, 1));
        btn.on('pointerdown', onClick);

        return btn;
    }

    exitGame() {
        window.close();
        this.showExitMessage();
    }

    showExitMessage() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setDepth(20);
        this.add.text(400, 270, 'Thanks for playing!', {
            fontSize: '28px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(21);
        this.add.text(400, 320, 'You can close this browser tab now.', {
            fontSize: '16px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(21);
    }
}