import * as Phaser from 'phaser';

export enum COLOR {
  GREEN = 'green',
  YELLOW = 'yellow',
  BLUE = 'blue'
}

enum STATE {
  RUNNING,
  GAME_OVER,
  WIN
}


export class MainScene extends Phaser.Scene {

  static MAX_VELOCITY = 1000;
  static MIN_VELOCITY = 150;
  static DECREASE_SPEED_FACTOR = 0.99;
  static TIME_TO_CHANGE_COLOR = 3000

  table: Phaser.GameObjects.Image;
  paddle: Phaser.GameObjects.Sprite;
  puck: Phaser.GameObjects.Sprite;
  bricks: Phaser.GameObjects.Group;
  opponentGoal: Phaser.GameObjects.Sprite
  playerGoal: Phaser.GameObjects.Sprite
  rightTransform: { color: COLOR, sprite: Phaser.GameObjects.Sprite }
  leftTransform: { color: COLOR, sprite: Phaser.GameObjects.Sprite }
  overlapTimer

  private paddleLastPosition: Phaser.Math.Vector2;
  private currentColor: COLOR;
  private currentState: STATE;

  // Setup parameters
  init() {
    this.currentState = STATE.RUNNING
    this.currentColor = COLOR.GREEN
  }

  preload() {
    this.load.image('table', 'assets/table.png');
    this.load.image('paddle', 'assets/paddle.png');

    this.load.image('puck-green', 'assets/puck-green.png');
    this.load.image('puck-yellow', 'assets/puck-yellow.png');
    this.load.image('puck-blue', 'assets/puck-blue.png');

    this.load.image('transform-green', 'assets/transform-green.png');
    this.load.image('transform-yellow', 'assets/transform-yellow.png');
    this.load.image('transform-blue', 'assets/transform-blue.png');

    this.load.image('brick-green', 'assets/brick-green.png');
    this.load.image('brick-yellow', 'assets/brick-yellow.png');
    this.load.image('brick-blue', 'assets/brick-blue.png');

    this.load.image('void', 'assets/void.png');
  }

  create() {
    const centerX = Number(this.game.config.width) / 2;
    const centerY = Number(this.game.config.height) / 2;
    this.table = this.add.sprite(centerX, centerY, 'table');
    const scaleFactor = Number(this.game.config.height) / this.table.height;
    this.table.setScale(scaleFactor, scaleFactor);
    const tableTopLeftX = this.table.x - (this.table.displayWidth / 2);
    const tableTopLeftY = this.table.y - (this.table.displayHeight / 2);
    this.physics.world.setBounds(tableTopLeftX, tableTopLeftY, this.table.displayWidth, this.table.displayHeight);
    this.initPaddle(centerX, centerY, scaleFactor)
    this.initPuck(centerX, centerY, scaleFactor)
    this.initTransforms(centerX, centerY, scaleFactor)
    this.initGoals(centerX, centerY, scaleFactor)
    this.generateBrickLines(tableTopLeftX, tableTopLeftY, scaleFactor)
  }

  initPaddle(centerX, centerY, scaleFactor) {
    const paddleYPosition = centerY + ((this.table.displayHeight / 2) - (this.table.displayHeight / 8));
    this.paddle = this.physics.add.sprite(centerX, paddleYPosition, 'paddle');
    this.paddleLastPosition = new Phaser.Math.Vector2(centerX, paddleYPosition)
    this.paddle.setScale(scaleFactor, scaleFactor);
    const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
    paddleBody.immovable = true
    paddleBody.setCircle(this.paddle.width / 2);
  }

  initPuck(centerX, centerY, scaleFactor) {
    const puckYPosition = centerY + ((this.table.displayHeight / 2) - (this.table.displayHeight / 4));
    this.puck = this.physics.add.sprite(centerX, puckYPosition, `puck-${this.currentColor}`);
    const puckBody = this.puck.body as Phaser.Physics.Arcade.Body;
    puckBody.collideWorldBounds = true;
    puckBody.setBounce(1, 1);
    puckBody.setVelocity(0, -200);
    puckBody.setMaxVelocity(MainScene.MAX_VELOCITY, MainScene.MAX_VELOCITY);
    this.puck.setScale(scaleFactor, scaleFactor);
    puckBody.setCircle(this.puck.width / 2);
  }

  initTransforms(centerX, centerY, scaleFactor) {
    const rightTransformXPosition = centerX - (this.table.displayWidth / 4);
    const rightTransformYPosition = centerY + (this.table.displayHeight / 4);
    this.rightTransform = {
      color: COLOR.YELLOW,
      sprite: this.physics.add.sprite(rightTransformXPosition, rightTransformYPosition, `transform-yellow`)
    }
    this.rightTransform.sprite.setScale(scaleFactor, scaleFactor);
    this.rightTransform.sprite.body.setCircle(this.rightTransform.sprite.width / 2)

    const leftTransformXPosition = centerX + (this.table.displayWidth / 4);
    const leftTransformYPosition = centerY + (this.table.displayHeight / 4);
    this.leftTransform = {
      color: COLOR.BLUE,
      sprite: this.physics.add.sprite(leftTransformXPosition, leftTransformYPosition, `transform-blue`),
    }
    this.leftTransform.sprite.setScale(scaleFactor, scaleFactor);
    this.leftTransform.sprite.body.setCircle(this.leftTransform.sprite.width / 2)
  }

  initGoals(centerX, centerY, scaleFactor) {
    const opponentGoalXPosition = centerX;
    const opponentGoalYPosition = centerY + (this.table.displayHeight / 2);
    this.opponentGoal = this.physics.add.sprite(opponentGoalXPosition, opponentGoalYPosition, 'void');
    this.opponentGoal.setScale(scaleFactor * 2.2, scaleFactor);

    const playerGoalXPosition = centerX;
    const playerGoalYPosition = centerY - (this.table.displayHeight / 2);
    this.playerGoal = this.physics.add.sprite(playerGoalXPosition, playerGoalYPosition, 'void');
    this.playerGoal.setScale(scaleFactor * 2.2, scaleFactor);
  }

  generateBrickLines(tableTopX, tableTopY, scaleFactor) {
    this.bricks = new Phaser.GameObjects.Group(this)
    const offset = this.table.displayWidth / 6
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 5; i++) {
        const newBrick = this.physics.add.sprite((tableTopX + (i + 1) * offset), (tableTopY + (j + 1) * offset), `brick-${this.getRandomColor()}`)
        newBrick.body.immovable = true
        newBrick.setScale(scaleFactor, scaleFactor)
        this.bricks.add(newBrick)
      }
    }
  }

  // Execution loop 60 times per second at best
  update() {
    switch (this.currentState) {
      case STATE.GAME_OVER:
        return this.displayGameOver()
      case STATE.WIN:
        return this.displayWin()
      default:
        return this.updateGameLoop()
    }
  }

  updateGameLoop() {
    this.physics.overlap(this.puck, this.opponentGoal, () => this.currentState = STATE.GAME_OVER)
    this.physics.overlap(this.puck, this.playerGoal, () => this.currentState = STATE.WIN)

    let isOverlapping = false
    this.physics.overlap(this.paddle, this.rightTransform.sprite, () => {
      isOverlapping = true
      if (!this.overlapTimer) {
        this.overlapTimer = setTimeout(() => this.changeColor(this.rightTransform), MainScene.TIME_TO_CHANGE_COLOR)
      }
    })
    this.physics.overlap(this.paddle, this.leftTransform.sprite, () => {
      isOverlapping = true
      if (!this.overlapTimer) {
        this.overlapTimer = setTimeout(() => this.changeColor(this.leftTransform), MainScene.TIME_TO_CHANGE_COLOR)
      }
    })

    if (!isOverlapping) {
      clearTimeout(this.overlapTimer)
      this.overlapTimer = undefined
    }

    // @ts-ignore
    this.physics.collide(this.puck, this.bricks, (puck, brick) => {
      if (brick.texture.key.includes(this.currentColor)) {
        brick.destroy()
      }
    })

    // Update paddle position
    this.paddle.x = this.input.x;
    this.paddle.y = this.input.y;

    // Update puck speed
    if (Math.abs(this.puck.body.velocity.x) > MainScene.MIN_VELOCITY) {
      this.puck.body.velocity.x = this.puck.body.velocity.x * MainScene.DECREASE_SPEED_FACTOR
    }
    if (Math.abs(this.puck.body.velocity.y) > MainScene.MIN_VELOCITY) {
      this.puck.body.velocity.y = this.puck.body.velocity.y * MainScene.DECREASE_SPEED_FACTOR
    }

    this.physics.collide(this.paddle, this.puck, this.paddlePuckCollisionHandler, null, this);

    // Store paddle position
    this.paddleLastPosition = this.paddle.getCenter();
  }

  displayWin() {
    if (confirm('YOU WIN\nSouhaitez-vous rejouer?')) {
      // @ts-ignore
      this.scene.restart()
    }
  }

  displayGameOver() {
    if (confirm('YOU LOOSE\nSouhaitez-vous rejouer?')) {
      // @ts-ignore
      this.scene.restart()
    }
  }

  getRandomColor(): COLOR {
    const randomInt = Math.random() * 100
    const randomKey = Object.keys(COLOR)[Math.floor(randomInt % Object.keys(COLOR).length)]
    return COLOR[randomKey]
  }

  changeColor(transform: { color: COLOR, sprite: Phaser.GameObjects.Sprite }) {
    const oldCurrentColor = this.currentColor
    this.currentColor = transform.color
    this.puck.setTexture(`puck-${this.currentColor}`)
    transform.color = oldCurrentColor
    transform.sprite.setTexture(`transform-${oldCurrentColor}`)
  }

  paddlePuckCollisionHandler() {
    const paddlePosition = this.paddle.getCenter();
    let velocityPaddleX = this.paddleLastPosition.x - paddlePosition.x;
    let velocityPaddleY = this.paddleLastPosition.y - paddlePosition.y;

    const paddleVector2 = new Phaser.Math.Vector2(velocityPaddleX, velocityPaddleY)
    let puckDirection = paddleVector2.normalize().negate()
 
    if (puckDirection.x === 0 && puckDirection.y === 0) {
      puckDirection = this.puck.body.velocity.negate()
    } else {
      this.puck.body.velocity.x = puckDirection.x * 500
      this.puck.body.velocity.y = puckDirection.y * 500
    }
  }
}
