import Phaser from '../lib/phaser.js';
import Carrot from '../game/Carrot.js';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  init() {
    // We init all the variables here
    this.carrotsCollected = 0;
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

  create() {
    // We use the assets loaded in preload function here
    this.add.image(240, 320, 'background').setScrollFactor(1, 0);
    // Dynamic Image
    //this.physics.add.image(240, 320, 'platform').setScale(0.5);
    this.platforms = this.physics.add.staticGroup();

    for (let i =0; i<5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      const platform = this.platforms.create(x, y, 'platform');
      platform.scale = 0.5;

      const body = platform.body;
      body.updateFromGameObject();
    }
    // Add player
    this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);

    // Adding Collider
    this.physics.add.collider(this.platforms, this.player);
    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.left = false
    this.player.body.checkCollision.right = false

    // Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    // Carrot
    this.carrots = this.physics.add.group({
      classType: Carrot
    });

    this.carrots.get(240, 320, 'carrot');
    this.physics.add.collider(this.platforms, this.carrots);

    // Adding Overlap
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectorCarrot,
      undefined,
      this
    )

    // Create points label
    const style = { color: '#000', fontSize: 24}
    this.carrotsText = this.add.text(240, 10, 'Carrots: 0', style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }

  update(t, dt) {
    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      this.player.setVelocityY(-400);
      this.player.setTexture('bunny-jump');
      this.sound.play('jump');
    }

    const vy = this.player.body.velocity.y;
    if (vy > 0 && this.player.texture.key !== 'bunny-stand') {
      this.player.setTexture('bunny-stand');
    }


    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200)
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200)
    } else {
      this.player.setVelocityX(0)
    }


    // Add logical section to move platforms to upper side
    this.platforms.children.iterate(child => {
      const platform = child;
      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        // Add carrots
        this.addCarrotAbove(platform);
      }
    });

    // Horizontal Wrap Player
    this.horizontalWrap(this.player);

    // Detect when player falls and game over.
    const bottomPlatform = this.findBottomPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start('game-over');
    }

  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;

    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const carrot = this.carrots.get(sprite.x, y, 'carrot');
    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);
    carrot.body.setSize(carrot.width, carrot.height);
    this.physics.world.enable(carrot);
    return carrot;
  }

  handleCollectorCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);
    const value = `Carrots: ${this.carrotsCollected}`;
    this.carrotsText.text = value;
    this.carrotsCollected++;
  }

  findBottomPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];

    for (let i = 1; i <= platforms.length-1; i++) {
      const platform = platforms[i];
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }
}