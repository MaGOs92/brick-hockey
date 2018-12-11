import {Brick, Paddle, Puck} from '../entities';
import * as Phaser from 'phaser';

export class MainScene extends Phaser.Scene {

  paddle: Paddle;
  puck: Puck;
  bricks: Brick[];

  // Setup parameters
  init() {

  }

  // Load assets
  preload() {
    this.load.image('table', 'assets/table.png');
    this.load.image('paddle', 'assets/paddle.png');
    this.load.image('puck', 'assets/puck.png');
  }

  // Create entities (player, enemies, ...)
  create() {
    const table = this.add.sprite(0, 0, 'table');
    // this.add.image(0, 0, 'background')
    //   .setOrigin(0, 0)
    //   .setScale(4, 3);
  }

  // Execution loop 60 times per second at best
  update() {

  }
}
