class WinScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScreen' });
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x1a2f1a);

        const catsRescued = this.registry.get('catsRescued');
        const catsTreated = this.registry.get('catsTreated');

        this.add.text(400, 110, '🐾 ALL CATS ARE SAFE! 🐾', {
            fontSize: '36px', color: '#ffdd57', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 165, 'You explored, defended, and treated your way\nthrough every level of Rescue Pawtrol.', {
            fontSize: '15px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        let summaryY = 230;

        if (typeof catsRescued === 'number') {
            this.add.text(400, summaryY, `Cats rescued & sheltered: ${catsRescued}`, {
                fontSize: '16px', color: '#00ff99'
            }).setOrigin(0.5);
            summaryY += 32;
        }

        if (typeof catsTreated === 'number') {
            this.add.text(400, summaryY, `🩹 Cats treated: ${catsTreated}`, {
                fontSize: '16px', color: '#00ff99'
            }).setOrigin(0.5);
            summaryY += 32;
        }

        this.add.text(400, summaryY + 20,
            'Real shelters rescue, defend, and treat animals like this every day.\nConsider adopting or volunteering at your local shelter. \nTreat strays the same way you would treat your pets, they deserve all the love and care as well.',
            { fontSize: '13px', color: '#cccccc', align: 'center' }
        ).setOrigin(0.5);

        const menuBtn = this.createButton(400, summaryY + 100, 'MAIN MENU', () => {
            this.scene.start('Menu');
        });

        this.add.text(400, summaryY + 150, 'Thanks for playing Rescue Pawtrol! 🐾', {
            fontSize: '13px', color: '#888888'
        }).setOrigin(0.5);
    }

    createButton(x, y, label, onClick) {
        const btn = this.add.rectangle(x, y, 220, 55, 0x4caf50, 1);
        btn.setStrokeStyle(3, 0xffffff, 1);
        btn.setInteractive({ useHandCursor: true });

        this.add.text(x, y, label, {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x66bb6a, 1));
        btn.on('pointerout', () => btn.setFillStyle(0x4caf50, 1));
        btn.on('pointerdown', onClick);

        return btn;
    }
}