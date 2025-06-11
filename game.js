class Tank {
  constructor(scene, name, color) {
    this.scene = scene;
    this.name = name;
    this.color = color;
    this.energy = 100;
    this.delete = false;
    this.angle = 0;
    this.sprite = scene.add.container(0, 0);

    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0xff00ff);
    graphics.strokeRect(-30, -40, 60, 60);
    graphics.fillStyle(color, 1);
    graphics.fillRect(-20, -40, 40, 20);
    graphics.fillRect(-10, -20, 20, 40);
    graphics.fillRect(-25, 0, 50, 10);

    this.energyBar = scene.add.rectangle(-50, -50, this.energy, 5, 0x00ff00).setOrigin(0, 0.5);

    this.sprite.add([graphics, this.energyBar]);
    this.sprite.setPosition(0, 0);
  }

  setPosition(x, y) {
    this.sprite.x = x + 20;
    this.sprite.y = y + 40;
  }

  addPosition(x, y) {
    this.sprite.x += x * Math.sin(this.sprite.rotation);
    this.sprite.y -= y * Math.cos(this.sprite.rotation);
  }

  addAngle(angle) {
    this.sprite.rotation += angle;
  }

  updateEnergy() {
    this.energyBar.width = this.energy;
  }
}

class Bullet {
  constructor(scene, owner) {
    this.scene = scene;
    this.reset(owner);
  }

  reset(owner) {
    this.owner = owner.name;
    this.color = owner.color;
    if (!this.rect) {
      this.rect = this.scene.add.rectangle(0, 0, 5, 5, this.color);
    }
    this.rect.x = owner.sprite.x + 0;
    this.rect.y = owner.sprite.y + 0;
    this.angle = owner.sprite.rotation;
    this.delete = false;
  }

  addPosition(x, y) {
    this.rect.x -= x * Math.sin(this.angle);
    this.rect.y += y * Math.cos(this.angle);
  }
}

class TankScene extends Phaser.Scene {
  constructor() {
    super('TankScene');
  }

  preload() {}

  create() {
    this.tanks = [
      new Tank(this, 'tank 1', 0x0000ff),
      new Tank(this, 'tank 2', 0xff0000)
    ];
    this.tanks[0].setPosition(50, 50);
    this.tanks[1].setPosition(250, 50);

    this.bullets = [];

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: 'A',
      w: 'W',
      d: 'D',
      s: 'S',
      r_shoot: Phaser.Input.Keyboard.KeyCodes.ALT,
      l_shoot: Phaser.Input.Keyboard.KeyCodes.CONTROL
    });
  }

  createBullet(tank) {
    for (const bullet of this.bullets) {
      if (bullet.delete) {
        bullet.reset(tank);
        return;
      }
    }
    const bullet = new Bullet(this, tank);
    this.bullets.push(bullet);
  }

  update() {
    // tank 0 controls
    if (this.cursors.left.isDown) this.tanks[0].addAngle(-0.1);
    if (this.cursors.right.isDown) this.tanks[0].addAngle(0.1);
    if (this.cursors.up.isDown) this.tanks[0].addPosition(-5, -5);
    if (this.cursors.down.isDown) this.tanks[0].addPosition(5, 5);

    // tank 1 controls
    if (this.keys.a.isDown) this.tanks[1].addAngle(-0.1);
    if (this.keys.d.isDown) this.tanks[1].addAngle(0.1);
    if (this.keys.w.isDown) this.tanks[1].addPosition(-5, -5);
    if (this.keys.s.isDown) this.tanks[1].addPosition(5, 5);

    if (Phaser.Input.Keyboard.JustDown(this.keys.r_shoot)) this.createBullet(this.tanks[0]);
    if (Phaser.Input.Keyboard.JustDown(this.keys.l_shoot)) this.createBullet(this.tanks[1]);

    for (const bullet of this.bullets) {
      bullet.addPosition(10, 10);
      if (
        bullet.rect.x >= 500 ||
        bullet.rect.y >= 500 ||
        bullet.rect.x <= 0 ||
        bullet.rect.y <= 0
      ) {
        bullet.delete = true;
        bullet.rect.visible = false;
      } else {
        bullet.rect.visible = true;
      }

      if (bullet.delete) continue;

      for (const tank of this.tanks) {
        if (!tank.delete && tank.name !== bullet.owner) {
          if (
            bullet.rect.x >= tank.sprite.x - 20 &&
            bullet.rect.y >= tank.sprite.y - 40 &&
            bullet.rect.x <= tank.sprite.x + 20 &&
            bullet.rect.y <= tank.sprite.y + 20
          ) {
            bullet.delete = true;
            tank.energy -= 20;
            if (tank.energy < 0) tank.energy = 0;
            tank.updateEnergy();
          }
        }
      }
    }

    for (const tank of this.tanks) {
      if (tank.energy <= 0 && !tank.delete) {
        tank.delete = true;
        alert(tank.name + ' is destroyed!');
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 500,
  height: 500,
  parent: 'game',
  backgroundColor: '#000000',
  scene: TankScene
};

new Phaser.Game(config);
