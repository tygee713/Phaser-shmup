var platforms
var ground
var ledge
var player
var enemies
var game
var cursors
var stars
var score
var scoreText
var gameOverText
var button
var pad1
var bullets
var playerBullets
var enemyBullets
var playerFireRate = 200
var enemyFireRate = 500
var playerNextFire = 0

export default class GameState extends Phaser.State {

  preload () {
    this.game.load.image('ground', '/assets/background.png')
    this.game.load.image('star', '/assets/star.png')
    this.game.load.image('diamond', 'assets/diamond.png')
    this.game.load.image('bulletb', 'assets/bulletb.png')
    this.game.load.image('bulletc', 'assets/bulletc.png')
    this.game.load.spritesheet('dude', '/assets/dude.png', 32, 48)
    this.game.load.spritesheet('baddie', '/assets/baddie.png', 32, 32)
    this.game.load.image('button', 'assets/button.png')
  }

	create () {
    game = this.game
    game.physics.startSystem(Phaser.Physics.ARCADE)

    ground = game.add.tileSprite(0, 0, game.width, game.height, 'ground')
    ground.fixedToCamera = true
    ground.tileScale.x = 2.0
    ground.tileScale.y = 2.0

    player = game.add.sprite(32, game.world.height - 150, 'dude')
    game.physics.arcade.enable(player)
    player.body.collideWorldBounds = true
    player.anchor.setTo(0.5, 0.5)
    player.health = 3

    stars = game.add.group()
    stars.enableBody = true
    for (var i = 0; i < 12; i++) {
      stars.create(i * 70, Math.floor(Math.random() * 101), 'star')
    }

    enemies = game.add.group()
    for (var i = 1; i < 5; i++) {
      enemies.create(32 + (100 * i), Math.floor(Math.random() * 200), 'baddie')
    }
    
    game.physics.arcade.enable(enemies)
    enemies.forEach(function(enemy) {
      enemy.health = 2
      enemy.nextFire = 0
    })

    // cursors = game.input.keyboard.createCursorKeys()
    game.input.gamepad.start()
    pad1 = game.input.gamepad.pad1

    score = 0
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#000' })
    gameOverText = game.add.text(0, 0, 'You have died. Press to restart', { fontSize: '32px', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle' })
    gameOverText.visible = false
    gameOverText.setTextBounds(0, 0, game.width, game.height)

    button = game.add.button(game.world.centerX - 95, game.world.centerY + 50, 'button', this.restartGame, this)
    button.visible = false

    bullets = game.add.group()
    playerBullets = game.add.group()
    enemyBullets = game.add.group()
    bullets.add(playerBullets)
    bullets.add(enemyBullets)
    bullets.forEach(function(bulletGroup) { 
      bulletGroup.enableBody = true
      bulletGroup.physicsBodyType = Phaser.Physics.ARCADE
      bulletGroup.createMultiple(50, 'bulletc')
      bulletGroup.setAll('checkWorldBounds', true)
      bulletGroup.setAll('outOfBoundsKill', true)
    })
	}

  update () {
    if (player.alive) {

      // Background scroll speed
      ground.tilePosition.y += 1

      // Enemy velocity and direction
      enemies.forEach(function(enemy) {
        enemy.position.y += 1
        if (enemy.alive && game.time.now > enemy.nextFire && enemyBullets.countDead() > 0 && player.alive) {
          enemy.nextFire = game.time.now + enemyFireRate
          var bullet = enemyBullets.getFirstDead()
          bullet.reset(enemy.x, enemy.y)
          game.physics.arcade.moveToObject(bullet, player, 300)
        }
      })

      // Star velocity
      stars.forEach(function(star) {
        star.position.y += 2
      })

      // Stand still if not actively moving
      player.body.velocity.x = 0
      player.body.velocity.y = 0

      // Determine player movement
      if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
        player.body.velocity.x = -150
        // player.body.velocity.y == 0 ? player.animations.play('left') : this.dictateDirection()
        // player.lastMovedDirection = 'left'
      } else if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
        player.body.velocity.x = 150
        // player.body.velocity.y == 0 ? player.animations.play('right') : this.dictateDirection()
        // player.lastMovedDirection = 'right'
      }

      if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -0.1) {
        // player.animations.stop()
        // this.dictateDirection()
        player.body.velocity.y = -150
      } else if (pad1.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1) {
        // player.animations.stop()
        // this.dictateDirection()
        player.body.velocity.y = 150
      } 

      // else {
      //   player.animations.stop()
      //   this.dictateDirection()
      // }

      var rightX = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) || 0.0
      var rightY = pad1.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) || 0.0
      player.isShooting = rightX !== 0.0 || rightY !== 0.0

      // Code for 8 directional input
      // if (rightX > 0.1 && Math.abs(rightY) < 0.1) {
      //   player.angle = 90
      // } else if (rightY > 0.1 && Math.abs(rightX) < 0.1) {
      //   player.angle = 180
      // } else if (rightX < -0.1 && Math.abs(rightY) < 0.1) {
      //   player.angle = 270
      // } else if (rightY < -0.1 && Math.abs(rightX) < 0.1) {
      //   player.angle = 0
      // } else if(rightX > 0.1 && rightY > 0.1) {
      //   player.angle = 135
      // } else if (rightX > 0.1 && rightY < -0.1) {
      //   player.angle = 45
      // } else if (rightX < -0.1 && rightY < -0.1) {
      //   player.angle = 315
      // } else if (rightX < -0.1 && rightY > 0.1) {
      //   player.angle = 225
      // } else if (rightX == 0.0 && rightY == 0.0) {
      //   player.angle = 0
      // } else {
      //   console.log("you fucked up")
      //   console.log(rightX)
      //   console.log(rightY)
      // }

      game.physics.arcade.overlap(player, stars, this.collectStar, null, this)
      game.physics.arcade.overlap(playerBullets, enemies, this.enemyHit, null, this)
      game.physics.arcade.overlap(enemyBullets, player, this.playerHit, null, this)
      game.physics.arcade.overlap(player, enemies, this.playerCollision, null, this)

      if (player.alive && player.isShooting) {
        player.rotation = Math.atan2(rightX, -rightY)
        if (game.time.now > playerNextFire && playerBullets.countDead() > 0) {
          playerNextFire = game.time.now + playerFireRate
          var bullet = playerBullets.getFirstDead()
          bullet.reset(player.x, player.y - player.height/4)
          game.physics.arcade.velocityFromRotation(player.rotation + 4.71239, 300, bullet.body.velocity)
        }
      } else {
        player.rotation = 0
      }
    } else {
      gameOverText.visible = true
      button.visible = true
    }
  }

  // render () {
  //   game.debug.spriteInfo(player, 32, 32)
  // }

  dictateDirection () {
    if (!!player.lastMovedDirection) {
      if (player.body.velocity.y == 0) {
        player.lastMovedDirection == 'right' ? player.frame = 5 : player.frame = 0
      } else {
        player.lastMovedDirection == 'right' ? player.frame = 6 : player.frame = 1
      }
    } else {
      player.frame = 5
    }
  }

  dissolveBullet (bullet, platform) {
    bullet.kill()
  }

  collectStar (player, star) {
    star.kill()

    score += 1
    scoreText.text = 'Score: ' + score
  }

  enemyHit (bullet, enemy) {
    bullet.kill()
    enemy.tint = 0xff0000
    enemy.health -= 1
    if (enemy.health == 0) {
      enemy.kill()
    }

    score += 1
    scoreText.text = 'Score: ' + score
  }

  playerHit (player, bullet) {
    bullet.kill()
    player.tint = 0xff0000
    player.health -= 1
    if (player.health == 0) {
      player.kill()
    }
  }

  playerCollision (player, enemy) {
    player.tint = 0xff0000
    player.health -= 1
    if (player.health == 0) {
      player.kill()
    }
  }

  restartGame () {
    this.game.state.restart()
  }
}
