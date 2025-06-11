const WEAPONS = {
  normal: { speed: 10, damage: 20, cost: 2, size: 5 },
  heavy: { speed: 5, damage: 40, cost: 5, size: 8 }
};

class Tank {
  constructor(scene, name, color, controller) {
    this.scene = scene;
    this.name = name;
    this.color = color;
    this.energy = 100;
    this.delete = false;
    this.angle = 0;
    this.currentWeapon = 'normal';
    this.controller = controller;
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
  constructor(scene, owner, weaponKey) {
    this.scene = scene;
    this.reset(owner, weaponKey);
  }

  reset(owner, weaponKey) {
    this.owner = owner.name;
    this.weapon = WEAPONS[weaponKey];
    this.color = owner.color;
    if (!this.rect) {
      this.rect = this.scene.add.rectangle(0, 0, this.weapon.size, this.weapon.size, this.color);
    }
    this.rect.width = this.weapon.size;
    this.rect.height = this.weapon.size;
    this.rect.x = owner.sprite.x;
    this.rect.y = owner.sprite.y;
    this.angle = owner.sprite.rotation;
    this.delete = false;
  }

  addPosition(distance) {
    this.rect.x -= distance * Math.sin(this.angle);
    this.rect.y += distance * Math.cos(this.angle);
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
      l_shoot: Phaser.Input.Keyboard.KeyCodes.CONTROL,
      q: 'Q',
      e: 'E'
    });

    this.tanks[0].controller = (t) => AI.keyboardAI(this.cursors, this.keys.r_shoot, this.keys.q, t);
    this.tanks[1].controller = (t) => AI.basicAI(t, this.tanks, this.bullets);
  }

  createBullet(tank) {
    const weapon = WEAPONS[tank.currentWeapon];
    if (tank.energy < weapon.cost) {
      return;
    }
    tank.energy -= weapon.cost;
    tank.updateEnergy();

    for (const bullet of this.bullets) {
      if (bullet.delete) {
        bullet.reset(tank, tank.currentWeapon);
        return;
      }
    }
    const bullet = new Bullet(this, tank, tank.currentWeapon);
    this.bullets.push(bullet);
  }

  update() {
    for (const tank of this.tanks) {
      if (tank.delete) continue;
      const act = tank.controller ? tank.controller(tank) : null;
      if (act) {
        if (act.turn) tank.addAngle(act.turn);
        if (act.move) tank.addPosition(act.move, act.move);
        if (act.fire) this.createBullet(tank);
      }

      if (tank.energy < 100) {
        tank.energy = Math.min(100, tank.energy + 0.05);
        tank.updateEnergy();
      }
    }

    for (const bullet of this.bullets) {
      const speed = bullet.weapon ? bullet.weapon.speed : 10;
      bullet.addPosition(speed);
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
            const dmg = bullet.weapon ? bullet.weapon.damage : 20;
            tank.energy -= dmg;
            if (tank.energy < 0) tank.energy = 0;
            tank.updateEnergy();
          }
        }
      }
    }

    for (const tank of this.tanks) {
      if (tank.energy <= 0 && !tank.delete) {
        tank.delete = true;
        const result = document.getElementById('result');
        if (result) {
          result.textContent = tank.name + ' is destroyed!';
        }
        this.scene.pause();
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
