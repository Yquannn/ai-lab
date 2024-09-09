function preload() {
  // Load the player sprite sheet
  this.load.spritesheet('player', './Cute_Fantasy_Free/Player/Player.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  // Load the actions sprite sheet
  // this.load.spritesheet('actions', './Cute_Fantasy_Free/Player/Player_Actions.png', {
  //   frameWidth: 32,
  //   frameHeight: 32,  
  // });

  this.load.spritesheet('actions', './Cute_Fantasy_Free/Player/Player_Actions.png', { frameWidth: 32, frameHeight: 32 })

  // Load the new cutting animation sprite sheet
  this.load.spritesheet('newCutting', './Cute_Fantasy_Free/Player/Player_Actions.png', {
    frameWidth: 64, // Adjust based on the actual frame width
    frameHeight: 64, // Adjust based on the actual frame height
  });

  this.load.image('land', './Cute_Fantasy_Free/Tiles/FarmLand_Tile.png');
  this.load.image('tree', './Cute_Fantasy_Free/Outdoor decoration/Oak_Tree.png');
  this.load.image('tree1', './asset/spr_tree1.png');
  this.load.image('tree2', './asset/spr_tree2.png');
  this.load.image('tree3', './asset/spr_tree3.png');

  this.load.image('water_tile', './asset/Water_Tile.png')

  this.load.spritesheet('campfire', './asset/Animated Campfire/spr_campfire_starting.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
	this.load.spritesheet('house', './asset/pixel-art-house-removebg-preview (2).png', {
    frameWidth: 128,
    frameHeight: 128,
  });
}

function createAnimations() {
  this.anims.create({
    key: 'burning',
    frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1,
  });

  const directions = ['down', 'left', 'right', 'up'];
  directions.forEach((direction, index) => {
    this.anims.create({
      key: `walk-${direction}`,
      frames: this.anims.generateFrameNumbers('player', { start: index * 4, end: index * 4 + 3 }),
      frameRate: 10,
      repeat: -1,
    });
  });




  this.anims.create({
    key: 'new-chopping',
    frames: this.anims.generateFrameNumbers('actions', { start: 2, end: 10 }), // Adjust start and end based on actual frames
    frameRate: 10,
    repeat: -1,
  });
}

function createHouse() {
  this.houseLocationX = 60;
  this.houseLocationY = 200;

  this.house = this.add
    .sprite(this.houseLocationX, this.houseLocationY, 'house')
    .setOrigin(0.5, 0.5)
    .setScale(1.2);
}


function createCampfire() {
  this.campLocationX = 70;
  this.campLocationY = 300;

  this.campfire = this.add
    .sprite(this.campLocationX, this.campLocationY, 'campfire')
    .setOrigin(0.5, 0.5)
    .setScale(.8)
    .anims.play('burning');
}
function createTrees() {
  this.trees = [];
  const maxTrees = 13;
  const treeMargin = 50;
  const treeImages = ['tree', 'tree1', 'tree2', 'tree3'];

  for (let i = 0; i < maxTrees; i++) {
    let randomX, randomY, isPositionValid;

    do {
      randomX = Phaser.Math.Between(150, 590);
      randomY = Phaser.Math.Between(80, 310);

      isPositionValid = this.trees.every((tree) => {
        const distance = Phaser.Math.Distance.Between(randomX, randomY, tree.x, tree.y);
        return distance >= treeMargin;
      });
    } while (!isPositionValid);

    const randomTreeImage = Phaser.Utils.Array.GetRandom(treeImages);
    const tree = this.add.image(randomX, randomY, randomTreeImage).setScale(1).setDepth(1);
    this.trees.push(tree);
  }
}


function createUI() {
  this.cutTimerText = this.add.text(16, 16, '', {
    fontSize: '16',
    fill: '#fff',
  });

  this.playerRest = this.add.text(180, 180, '', {
    fontSize: '16',
    fill: '#fff',
  });

  this.stamina = 20;
  this.staminaText = this.add.text(this.cameras.main.width - 80, 16, `Stamina: ${this.stamina}`, {
    fontSize: '16',
    fill: '#fff',
    align: 'right',
  });

	this.collectedLog = 0
	this.collectedLogText =  this.add.text(this.cameras.main.width - 200, 16, `Collected Logs : ${this.collectedLog}`, {
    fontSize: '16',
    fill: '#fff',
    align: 'right',
  });

	this.logCollectable = 0
	this.logCollectableText =  this.add.text(this.cameras.main.width - 300, 16, `Dropped logs: ${this.logCollectable}`, {
    fontSize: '16',
    fill: '#fff',
    align: 'right',
  });


}
function handlePlayerMovement() {
  const cursors = this.input.keyboard.createCursorKeys();
  let isPlayerMoving = false;

  const visionDistance = 1000;
  let nearestTree = null;
  let minDistance = visionDistance;

  // Find the nearest tree
  this.trees.forEach((tree) => {
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, tree.x, tree.y);
    if (distance < minDistance) {
      minDistance = distance;
      nearestTree = tree;
    }
  });

let speed = 100; // Adjust speed as needed

  // Check if player is in the process of returning to the campfire
  if (this.returningToCampfire) {
    moveToStorageRoom.call(this, speed);

    const distanceToCampfire = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.houseLocationX, this.houseLocationY);
    if (distanceToCampfire < 1) { // Player has reached the campfire
      this.returningToCampfire = false;
      this.collectedLog = 0; // Now reset the log count after reaching the campfire
      this.cutTimerText.setText('Logs dropped off!');
			this.collectedLogText.setText(`Collected logs: ${this.collectedLog}`)
			this.logCollectable += 1
			this.logCollectableText.setText(`Dropped logs: ${this.logCollectable}`)

    }
  } else if (this.stamina === 0) {
    // If the player has no stamina, move to the campfire to rest
    this.cutTimerText.setText('Not enough stamina. WoodCutter Resting...');
    moveToCampfire.call(this, speed);
  } else if (this.collectedLog === 3) {
    // If the player has collected 3 logs, start returning to the campfire
    this.cutTimerText.setText('Returning to house log to drop logs...');
    this.returningToCampfire = true;
  } else if (nearestTree) {
    // If the player has stamina and hasn't collected 3 logs yet, move to the nearest tree
    moveToTree.call(this, nearestTree, speed);
    isPlayerMoving = true;

    const cutDistance = 10;
    if (minDistance < cutDistance) {
      startChoppingTree.call(this, nearestTree);
    }
  }
}



function moveToStorageRoom(speed) {
  const directionX = this.houseLocationX - this.player.x;
  const directionY = this.houseLocationY - this.player.y;
  const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
  const normalizedX = directionX / magnitude;
  const normalizedY = directionY / magnitude;

  this.player.setVelocity(normalizedX * 30, normalizedY * 30);
  playWalkAnimation.call(this, normalizedX, normalizedY);


}


function moveToCampfire(speed) {
  const directionX = this.campLocationX - this.player.x;
  const directionY = this.campLocationY - this.player.y;
  const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
  const normalizedX = directionX / magnitude;
  const normalizedY = directionY / magnitude;

  this.player.setVelocity(normalizedX * speed, normalizedY * speed);

  playWalkAnimation.call(this, normalizedX, normalizedY);
}

function moveToTree(nearestTree, speed) {
  const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearestTree.x, nearestTree.y);
  this.player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

  playWalkAnimation.call(this, Math.cos(angle), Math.sin(angle));
}

function playWalkAnimation(normalizedX, normalizedY) {
  if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
    this.player.anims.play(normalizedX > 0 ? 'walk-right' : 'walk-left', true);
  } else {
    this.player.anims.play(normalizedY > 0 ? 'walk-down' : 'walk-up', true);
  }
}

function startChoppingTree(nearestTree) {
  this.player.setVelocity(0);
  this.player.anims.stop();

  if (this.stamina > 0) {
    this.player.anims.play('new-chopping', true); // Play the new chopping animation

    if (!this.timerEvent) {
      let countdown = 5;
      this.cutTimerText.setText(`Cutting: ${countdown} seconds`);

      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          countdown--;
          this.cutTimerText.setText(`Cutting: ${countdown} seconds`);
          if (countdown <= 0) {
            completeChoppingTree.call(this, nearestTree);
          }
        },
        callbackScope: this,
        loop: true,
      });
    }
  }
}

function completeChoppingTree(nearestTree) {
  this.cutTimerText.setText('Tree cut down!');
  nearestTree.destroy();
  this.timerEvent.remove(false);
  this.timerEvent = null;
  this.player.anims.stop();
  this.trees = this.trees.filter((t) => t !== nearestTree);

  this.stamina -= 10;
  this.stamina = Phaser.Math.Clamp(this.stamina, 0, 100);
  this.staminaText.setText(`Stamina: ${this.stamina}`);

	this.collectedLog += 1
	this.collectedLogText.setText(`Collected log: ${this.collectedLog}`);


  if (this.stamina === 0) {
    this.time.delayedCall(10000, () => {
      this.stamina = 100;
      this.staminaText.setText(`Stamina: ${this.stamina}`);
      this.playerRest.setText('');
    });
  }

  respawnTree.call(this);
}
function respawnTree() {
  const treeRespawnDelay = 15000; // 15 seconds
  const treeMargin = 50;
  const treeImages = ['tree', 'tree1', 'tree2', 'tree3'];

  this.time.delayedCall(treeRespawnDelay, () => {
    let randomX, randomY, isPositionValid;

    do {
      randomX = Phaser.Math.Between(150, 590); // Adjusted bounds to match `createTrees`
      randomY = Phaser.Math.Between(80, 310);  // Adjusted bounds to match `createTrees`

      isPositionValid = this.trees.every((tree) => {
        const distance = Phaser.Math.Distance.Between(randomX, randomY, tree.x, tree.y);
        return distance >= treeMargin;
      });
    } while (!isPositionValid);

    const randomTreeImage = Phaser.Utils.Array.GetRandom(treeImages);
    const newTree = this.add.image(randomX, randomY, randomTreeImage).setScale(1).setDepth(1);
    this.trees.push(newTree);
  });
}


function create() {
  // Add background and set scale
  this.land = this.add.tileSprite(320, 180, 1500, 1000, 'land');
  this.land.setScale(0.5);

  // Create animations, campfire, house, trees, and UI
  createAnimations.call(this);
  createCampfire.call(this);
  createHouse.call(this);
  createTrees.call(this);
  createUI.call(this);

  this.player = this.physics.add.sprite(100, 100, 'player').setDepth(2);

  // Adjust the player's bounding box
  this.player.setSize(16, 16); // Set the width and height of the bounding box
  this.player.setOffset(6, 2); // Adjust the offset to align the bounding box with the sprite

  // Create and configure the water tile
  const obstacles = this.physics.add.staticGroup();
  const waterTile = obstacles.create(140, 100, 'water_tile').setScale(0.7);

  // Adjust the water tile's bounding box
  waterTile.body.setSize(32, 80);
  waterTile.body.setOffset(0, 0); // Adjust the offset if necessary

  // Add collider between player and obstacles
  this.physics.add.collider(this.player, obstacles);
}




function update() {
  handlePlayerMovement.call(this);

}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  backgroundColor: "b9eaff",
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 100 },
      enableBody: true,
      debug: true
    },
  },
  scene: {
    preload,
    create,
    update,
  },
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
