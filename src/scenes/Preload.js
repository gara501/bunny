import Phaser from '../lib/phaser.js';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload() {
    // We load images, audio and other stuff here
    this.load.image('background', '../src/assets/Background/bg_layer1.png');
    // Platforms
    this.load.image('platform', '../src/assets/Environment/ground_grass.png');
    // Load player
    this.load.image('bunny-stand', '../src/assets/Players/bunny1_stand.png');
    this.load.image('bunny-jump', '../src/assets/Players/bunny1_jump.png');
    // Load Carrot
    this.load.image('carrot', '../src/assets/Items/carrot.png');

    // Load Audio
    this.load.audio('jump', '../src/assets/sounds/jump.ogg')

    this.cursors = this.input.keyboard.createCursorKeys();
  }
}