import { MainScene } from './scenes';

const gameConfig: GameConfig = {
  title: 'Brick Hockey',
  version: '0.0.0',
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#FFFFFF',
  physics: {
    default: 'arcade',
    arcade: {}
  },
  scene: MainScene
};

export default gameConfig;
