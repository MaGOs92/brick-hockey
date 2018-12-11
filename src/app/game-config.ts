import {MainScene} from './scenes';

const gameConfig: GameConfig = {
  title: 'Brick Hockey',
  version: '0.0.0',
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: MainScene
};

export default gameConfig;
