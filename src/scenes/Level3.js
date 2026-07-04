class Level3 extends Phaser.Scene {
 
  constructor() {
    super({ key: 'Level3' });
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x2b2438);

    this.gameOver = false;
    this.savedCount = 0;
    this.targetSaves = 12;
    this.timeRemaining = 75;
    this.selectedCat = null;

    this.needTypes = ['bandage', 'medicine', 'food'];
    this.needEmoji = { bandage: '🩹', medicine: '💉', food: '🍖' };
    this.needColor = {
      bandage: 0xff6b6b,
      medicine: 0x66ccff,
      food: 0xffd166
    };

    this.stations = [];
    const stationX = [200, 400, 600];

    this.needTypes.forEach((type, i) => {
      const station = this.add.rectangle(stationX[i], 540, 140, 80, this.needColor[type], 0.85);
      station.setStrokeStyle(3, 0xffffff, 1);
      station.needType = type;
      station.setInteractive({ useHandCursor: true });

      this.add.text(stationX[i], 540, this.needEmoji[type], {
        fontSize: '32px'
      }).setOrigin(0.5);

      station.on('pointerdown', () => this.onStationClicked(station));
      this.stations.push(station);
    });

    
  }

  update() {

  }
  onStationClicked(station) {
    console.log('Station clicked:', station.needType);
  }
}