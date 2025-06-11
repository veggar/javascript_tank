// Simple AI routines for tanks
// Returns actions in the form {turn, move, fire, weapon}
// turn: radians to rotate this frame
// move: distance factor to move forward/backward (negative is forward)
// fire: boolean indicating whether to fire this frame
// weapon: weapon key string

function basicAI(tank, enemies, bullets) {
  // Find first alive enemy
  const targets = enemies.filter(e => !e.delete && e !== tank);
  if (targets.length === 0) {
    return {turn: 0, move: 0, fire: false, weapon: tank.currentWeapon};
  }
  const target = targets[0];
  const dx = target.sprite.x - tank.sprite.x;
  const dy = target.sprite.y - tank.sprite.y;
  const desired = Math.atan2(-dx, dy);
  let diff = desired - tank.sprite.rotation;
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  const turn = Math.max(-0.05, Math.min(0.05, diff));
  const dist = Math.sqrt(dx * dx + dy * dy);
  const move = dist > 150 ? -3 : 0;
  const fire = Math.abs(diff) < 0.2 && dist < 200;
  // Switch weapon based on remaining energy
  if (tank.energy > 50) {
    tank.currentWeapon = 'heavy';
  } else if (tank.energy < 20) {
    tank.currentWeapon = 'normal';
  }
  return {turn, move, fire, weapon: tank.currentWeapon};
}

function keyboardAI(keys, fireKey, weaponToggleKey, tank) {
  let turn = 0;
  if (keys.left.isDown) turn -= 0.1;
  if (keys.right.isDown) turn += 0.1;

  let move = 0;
  if (keys.up.isDown) move -= 5;
  if (keys.down.isDown) move += 5;

  if (weaponToggleKey && Phaser.Input.Keyboard.JustDown(weaponToggleKey)) {
    tank.currentWeapon = tank.currentWeapon === 'normal' ? 'heavy' : 'normal';
  }

  const fire = fireKey && Phaser.Input.Keyboard.JustDown(fireKey);
  return {turn, move, fire, weapon: tank.currentWeapon};
}

window.AI = { basicAI, keyboardAI };
