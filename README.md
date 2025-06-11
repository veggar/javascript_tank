# javascript_tank

This project demonstrates a simple two player tank game using [Phaser](https://phaser.io/).
Open `index.html` in a browser to run the game.

Arrow keys move the blue tank and `A/W/S/D` control the red tank.
`Alt` and `Ctrl` fire the currently selected weapon.
Press `Q` (blue tank) or `E` (red tank) to switch between **normal** and **heavy** shots.
Each weapon costs energy to fire (2 for normal, 5 for heavy) and deals different damage.
Tanks slowly regain energy over time. When a tank is destroyed a message appears below the game.
The red tank uses a basic AI while the blue tank reacts to keyboard input through the same AI interface.
