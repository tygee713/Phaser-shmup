import GameState from 'states/GameState'
const GAME = new Phaser.Game(512, 640, Phaser.AUTO);

GAME.state.add('GameState', GameState);

GAME.state.start('GameState');