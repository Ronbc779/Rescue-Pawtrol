class Level3 extends Phaser.Scene {
 
  constructor() {
    super({ key: 'Level3' });
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x2b2438);

    this.gameOver = false;
    this.savedCount = 0;
    this.targetSaves = 30;
    this.timeRemaining = 60;
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

    this.scoreText = this.add.text(20, 20, `Saved: 0 / ${this.targetSaves}`, {
      fontSize: '18px', color: '#00ff99', fontStyle: 'bold'
    });

    this.timerText = this.add.text(400, 20, `${this.timeRemaining}s`, {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.add.text(20, 50, 'Click a cat, then click its matching station.', {
      fontSize: '13px', color: '#cccccc'
    });

    this.waitingCats = [];
    this.spawnWaitingCat();
    this.spawnWaitingCat();
    this.spawnWaitingCat();

    this.startTimers();

    this.bgMusic = this.sound.add('bg3', { loop: true, volume: 0.4 });
    this.bgMusic.play();

    this.events.on('shutdown', () => {
      this.bgMusic.stop();
    });
  }

  update() {

  }
  onStationClicked(station) {
    if (this.gameOver) return;
    if (!this.selectedCat) return;

    const cat = this.selectedCat;

    if (cat.needType === station.needType) {
      this.sound.play('correct', { volume: 0.5});
      this.saveCat(cat);
    } else {
      this.sound.play('wrong', { volume: 0.5});
      this.wrongMatch(station);
    }

    this.selectedCat = null;
  }

  findOpenSlot() {
    const slots = [
      { x: 150, y: 150 }, { x: 400, y: 150 }, { x: 650, y: 150 },
      { x: 150, y: 280 }, { x: 400, y: 280 }, { x: 650, y: 280 }
    ];
    for (let i = 0; i < slots.length; i++) {
      const taken = this.waitingCats.some(c => c.slotIndex === i);
      if (!taken) {
        return { x: slots[i].x, y: slots[i].y, index: i };
      }
    }
    return null;
  }

  spawnWaitingCat() {
    if (this.gameOver) return;
    if (this.waitingCats.length >= 6) return;

    const needType = Phaser.Utils.Array.GetRandom(this.needTypes);
    const slot = this.findOpenSlot();
    if (!slot) return;

    // Reuse the same cat sprites from Level 1 / Level 2
    const catKeys = ['white_cat1','white_cat2','gray_cat1','gray_cat2','orange_cat1','orange_cat2'];
    const randomKey = Phaser.Utils.Array.GetRandom(catKeys);

    const cat = this.textures.exists(randomKey)
      ? this.add.sprite(slot.x, slot.y, randomKey)
      : this.add.circle(slot.x, slot.y, 18, 0xffffff);
    cat.setScale(1.5);

    cat.setInteractive({ useHandCursor: true });
    cat.needType = needType;
    cat.slotIndex = slot.index;

    const icon = this.add.text(slot.x, slot.y - 30, this.needEmoji[needType], {
      fontSize: '22px'
    }).setOrigin(0.5);
    cat.icon = icon;

    const ring = this.add.circle(slot.x, slot.y, 26, 0xffffff, 0);
    ring.setStrokeStyle(3, 0xffffff, 0);
    cat.selectionRing = ring;

    cat.on('pointerdown', () => this.onCatClicked(cat));
    this.waitingCats.push(cat);
  }

  onCatClicked(cat) {
    if (this.gameOver) return;
    if (!cat.active) return;

    if (this.selectedCat && this.selectedCat !== cat) {
      this.selectedCat.selectionRing.setStrokeStyle(3, 0xffffff, 0);
    }

    this.selectedCat = cat;
    cat.selectionRing.setStrokeStyle(3, 0xffffff, 1);
  }

  saveCat(cat) {
    this.waitingCats = this.waitingCats.filter(c => c !== cat);

    this.tweens.add({
      targets: [cat, cat.icon, cat.selectionRing],
      y: '-=40',
      alpha: 0,
      duration: 400,
      onComplete: () => {
        cat.destroy();
        cat.icon.destroy();
        cat.selectionRing.destroy();
      }
    });

    this.savedCount++;
    this.scoreText.setText(`Saved: ${this.savedCount} / ${this.targetSaves}`);

    if (this.savedCount >= this.targetSaves) {
      this.endRound(true);
    }
  }

  wrongMatch(station) {
    const originalColor = this.needColor[station.needType];
    station.setFillStyle(0xff0000, 0.9);
    this.time.delayedCall(200, () => {
      if (station.active) station.setFillStyle(originalColor, 0.85);
    });

    this.timeRemaining = Math.max(0, this.timeRemaining - 3);
    this.timerText.setText(`${this.timeRemaining}s`);

    if (this.selectedCat) {
      this.selectedCat.selectionRing.setStrokeStyle(3, 0xffffff, 0);
    }

    if (this.timeRemaining <= 0) {
      this.endRound(false);
    }
  }

  startTimers() {
    this.countdownEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameOver) return;
        this.timeRemaining--;
        this.timerText.setText(`${this.timeRemaining}s`);
        if (this.timeRemaining <= 30) {
          this.timerText.setColor('#ffaa00');
        }

        if (this.timeRemaining <= 15) {
          this.timerText.setColor('#ff3333');
        }

        if (this.timeRemaining <= 0) {
          this.endRound(false);
        }
      }
    });
    this.currentSpawnDelay = 1800;
    this.nextSpawn();
  }

  nextSpawn() {
    if (this.gameOver) return;

    this.spawnEvent = this.time.delayedCall(this.currentSpawnDelay, () => {
      this.spawnWaitingCat();
      this.currentSpawnDelay = Math.max(600, this.currentSpawnDelay - 40);
      this.nextSpawn();
    });
  }

  endRound(won) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.sound.play(won ? 'win' : 'lose', { volume: 0.5});

    if (this.countdownEvent) this.countdownEvent.remove();
    if (this.spawnEvent) this.spawnEvent.remove();

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75).setDepth(20);

    const title = won ? 'ALL TREATED!' : 'TIME\'S UP';
    const titleColor = won ? '#00ff99' : '#ff3333';

    this.add.text(400, 230, title, {
      fontSize: '40px', color: titleColor, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);

    this.add.text(400, 295, `Cats treated: ${this.savedCount} / ${this.targetSaves}`, {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(21);

    if (won) {
      this.add.text(400, 345, 'Every animal deserves care and the right needs.', {
        fontSize: '14px', color: '#ffdd57', align: 'center'
      }).setOrigin(0.5).setDepth(21);
    }

    const continueBtn = this.add.rectangle(400, 390, 220, 50, 0x2196f3, 1)
      .setScrollFactor(0).setDepth(21).setInteractive({ useHandCursor: true });
    continueBtn.setStrokeStyle(3, 0xffffff, 1);

    this.add.text(400, 390, won ? 'Yipee' : 'Continue', {
      fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    continueBtn.on('pointerdown', () => {
      if (won) {
        this.registry.set('catsTreated', this.savedCount);
        this.scene.start('WinScreen');
      } else {
        this.scene.start('Menu');
      }
    });
    continueBtn.on('pointerover', () => continueBtn.setFillStyle(0x42a5f5, 1));
    continueBtn.on('pointerout', () => continueBtn.setFillStyle(0x2196f3, 1));

    this.add.text(400, 450, 'Press R to try again', {
      fontSize: '18px', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(21);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }
}