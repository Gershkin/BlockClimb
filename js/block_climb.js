/*Author: Sam Gershkovich 000801766
  Date: November 1, 2020
*/



var numPlayers = document.getElementById("numPlayers").value;
var p1Color = document.getElementById("p1Color").value;
var p2Color = document.getElementById("p2Color").value;
var playerCollision = document.getElementById("playerCollision").value;
var friendlyFire = document.getElementById("friendlyFire").value;
var musicVolume = document.getElementById("musicVolume").value;
var soundVolume = document.getElementById("soundVolume").value;
var blockOutlines = document.getElementById("blockOutlines").value;
var showHighScores = document.getElementById("showHighScores").value;



//Save all the settings to session storage
sessionStorage.numPlayers = numPlayers;
sessionStorage.p1Color = p1Color;
sessionStorage.p2Color = p2Color;
sessionStorage.playerCollision = playerCollision;
sessionStorage.friendlyFire = friendlyFire;
sessionStorage.musicVolume = musicVolume;
sessionStorage.soundVolume = soundVolume;
sessionStorage.blockOutlines = blockOutlines;
sessionStorage.showHighScores = showHighScores;

var leftButton = document.getElementById("left");
var rightButton = document.getElementById("right");
var jumpButton = document.getElementById("jump");
var shootButton = document.getElementById("shoot");



var submitScoreForm = document.forms[0];
var pauseMenu = document.forms[1];

var formScore = document.getElementById("score");
var hiddenScore = document.getElementById("hiddenScore");
var formNewBest = document.getElementById("best");
var nameInput = document.getElementById("nameInput");
var submitScore = document.getElementById("submit");

var jumpSound = document.getElementById("jumpSound");
jumpSound.volume = soundVolume;

var scoreSound1 = document.getElementById("scoreSound1");
var scoreSound2 = document.getElementById("scoreSound2");
scoreSound1.volume = soundVolume;
scoreSound2.volume = soundVolume;

var chargeSound1 = document.getElementById("chargeSound1");
var chargeSound2 = document.getElementById("chargeSound2");
chargeSound1.volume = soundVolume;
chargeSound2.volume = soundVolume;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var gridSize = 0;//The grid size of the game

var sizeRatio = 0;//The ratio to scale the game

var refreshRate = 1;//Frame rate

var root = document.documentElement;

var b = document.body;
var bWidth = 0;//Width of the body
var bHeight = 0;//Height of the body

//When the window is resized, re-calibrate the canvas
window.addEventListener("resize", function () {
    SetCanvas();
});

//When the window is rotated(mobile), re-calibrate the canvas
window.addEventListener("rotate", function () {
    SetCanvas();
});

//Calibrate the canvas and game
function SetCanvas() {

    //Maintain the background image's(the arcade machine) 
    //aspect ration no matter the size width or height of the window
    bWidth = window.innerWidth;
    bHeight = bWidth / 1.4;

    //If the current aspect ratio draws the background bigger than the height of the window(causes scroll bar to appear)
    //reduce the width of the arcade machine
    if (bHeight > window.innerHeight) {
        bHeight = window.innerHeight;
        bWidth = bHeight * 1.4;
    }

    //Set the arcade machine style properties
    b.style.backgroundSize = bWidth + 'px ' + bHeight + 'px';
    b.style.backgroundRepeat = "no-repeat";
    b.style.backgroundColor = "black";
    b.style.backgroundPositionX = "center";

    //Set the canvas to always be located in place of the arcade machine screen
    canvas.style.marginTop = bHeight / 10.2041 + "px";

    //Set the size of the canvas to the size of the arcade machine screen
    let sizeX = bWidth / 2.0723; //(arcade machine width / left edge of arcade machine screen = 2.0723)
    let sizeY = bHeight / 1.6026;//(arcade machine height / top edge of arcade machine screen =  1.6026)

    //Calculate how much to scale the canvas based on the current device display pixel ratio
    let scale = window.devicePixelRatio;

    /*Set the canvas's size and resolution
    * The canvas's style width and height determine the size of the canvas itself,
    * whereas the canvas's width and height properties determine the size of the canvas's coordinate system;
    */
    canvas.style.width = sizeX + "px";
    canvas.style.height = sizeY + "px";

    //Scale the choordinate system based on the pixel scale
    canvas.width = sizeX * scale;
    canvas.height = sizeY * scale;

    playWidth = canvas.width;
    playHeight = canvas.height;

    //Set the css property to the arcade width so that the HTML elements and text can scale arcoding to the size of the arcade
    root.style.setProperty('--arcade-width', bWidth + "px");

    //Position the game over form in the center of the arcade
    submitScoreForm.style.left = window.innerWidth / 2 - submitScoreForm.scrollWidth / 2 + "px";
    submitScoreForm.style.top = bHeight / 7.3994 + "px";

    pauseMenu.style.left = window.innerWidth / 2 - pauseMenu.scrollWidth / 2 + "px";
    pauseMenu.style.top = bHeight / 3.3994 + "px";

    //Calculate the grid size for the game
    gridSize = playWidth / 16;

    /*Determine the ratio to scale all objects and forces in the game.

    * All the object sizes, speeds, and forces were setup and tweaked while the game was set at a fixed size of 400px,
    * so determine the ratio by dividing the current width by 400
    */
    sizeRatio = playWidth / 400;
}

//Stop the frame redraw
function Stop() {

    //If the timeout variable is defined(the game is running)
    if (typeof timeout !== 'undefined') {

        //Stop the re-draw 
        clearTimeout(timeout);

        //Stop the block spawning
        clearTimeout(spawnTimeout);
    }
}

//Get a random int in a range
function Rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Block class
class Block {

    //Static block id
    static blockID = 1;

    constructor(x, y, size) {

        //Location of the block on the canvas
        this.x = x;
        this.y = y;

        this.prevY = y;//The y position last frame

        this.vy = 0;//Y velocity

        //Set the id of this block and increment the static id variable
        this.id = Block.blockID;
        Block.blockID++;

        this.width = 0;//The width of the block

        this.height = 0;//The height of the block

        this.size = size;

        this.health = 0;//The health of the block

        this.frameCounter = 0;//Frame counter for hit animation

        this.hit = false;//Whether the block was hit by a bullet

        this.hitColor = "white";//The color to flash when hit by a bullet

        this.grounded = false;//Whether the block has landed on the ground or another block

        this.fallingFrameCounter = 0;

        this.deadly = false;

        if (players.length > 0) {
            if (numPlayers == 1 && p1Score > 500 && (size == 1 || size == 4)) {
                if (Rand(1, 10) == 5) {
                    this.deadly = true;
                }
            }
            else if (numPlayers == 2 && highscore > 150 && (size == 1 || size == 4)) {
                if (Rand(1, 10) == 5) {
                    this.deadly = true;
                }
            }
        }

        this.hitPlatform = false;//Whether the block has hit the cleanup platform

        this.isFloor = false;//Whether this block is the floor

        this.isPlatform = false; //Whether this block is a cleanup platform

        this.platformed = false;//Whether a cleanup has occured

        this.justSpawned = true;//Whether the block has just spawned

        if (this.deadly) {
            this.color = "red";//The color of the block
        } else {
            this.color = "#000";//The color of the block
        }

        //Determine which size to make this block
        switch (size) {
            case -1://platform
                this.width = playWidth;
                this.height = gridSize * 2;
                this.health = 1;
                this.x = playWidth / 2;
                this.y = playHeight + this.height;
                this.isPlatform = true;
                break;
            case 1: //big
                this.width = gridSize * 2;
                this.height = gridSize * 2;
                this.health = 4;
                break;
            case 2: //half width
                this.width = gridSize;
                this.height = gridSize * 2;
                this.health = 2;
                break;
            case 3: //half height
                this.width = gridSize * 2;
                this.height = gridSize;
                this.health = 2;
                break;
            case 4: //small
                this.width = gridSize;
                this.height = gridSize;
                this.health = 1;
                break;
            case 5:
                this.width = gridSize * 4;
                this.height = gridSize;
                this.health = 4;
                break;
            case 6:
                this.width = gridSize;
                this.height = gridSize * 4;
                this.health = 4;
                break;
            case 7:
                this.width = gridSize * 2;
                this.height = gridSize * 6;
                this.health = 6;
                break;

        }
        //Determine which column to spawn this block in(game is split into 16 columns)
        if (!this.isPlatform) {
            this.x = x * gridSize - this.width / 2;
            this.y -= this.height * 1.25;
        }
        if (this.deadly) {
            this.health = 1;
        }
    }

    Delete() {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i] == undefined) {
                continue;
            }
            if (blocks[i].id == this.id) {
                delete (blocks[i]);
                return;
            }
        }
    }

    //Function dealing with this block being hit by a bullet
    Hit(bullet) {
        if (!this.isFloor) {
            this.hit = true;

            this.frameCounter = 0;

            if (bullet.charge > 50) {
                this.health -= 0.4;
            } else {
                this.health--;
            }
            if (this.health > 0) {
                var hitSound = new Audio("sounds/block_hit.wav");
                hitSound.volume = soundVolume;
                hitSound.play();
            }

            //The block has been destroyed
            if (this.health <= 0) {

                if (this.deadly) {
                    //Play the explode sound
                    var explosion = new Audio("sounds/explosion.wav");
                    explosion.volume = soundVolume;
                    explosion.play();
                }
                else {
                    var breakSound = new Audio("sounds/block_break.wav");
                    breakSound.volume = soundVolume;
                    breakSound.play();
                }

                if (this.deadly) {
                    this.Explode();
                }
                else {
                    this.Delete();
                }
                ReIndexBlocks();
            }
        }
    }

    Explode() {
        //Loop through every block in the blocks array
        for (var i = 0; i < blocks.length; i++) {

            //Skip if the current index block is this, or null
            if (blocks[i] == this || blocks[i] == null || blocks[i].isPlatform || blocks[i].isFloor) {
                continue;
            }

            let distance = Math.pow(Math.pow(Math.abs(this.x - blocks[i].x), 2) + Math.pow(Math.abs(this.y - blocks[i].y), 2), 0.5);

            if (distance <= gridSize * 4) {
                blocks[i].Delete();
            }
        }
        for (var i = 0; i < players.length; i++) {
            let distance = Math.pow(Math.pow(Math.abs(this.x - players[i].x), 2) + Math.pow(Math.abs(this.y - players[i].y), 2), 0.5);
            if (distance <= gridSize * 4) {

                let deltaX = players[i].x - this.x;
                let factorX = 1 - Math.abs(deltaX) / (gridSize * 4);

                let deltaY = players[i].y - this.y;
                let factorY = 1 - Math.abs(deltaY) / (gridSize * 4);

                players[i].vx += (gridSize * 4 * factorX * (deltaX / Math.abs(deltaX))) / 30;
                players[i].vy += (gridSize * 4 * factorY * (deltaY / Math.abs(deltaY))) / 30;

                players[i].explodedX = true;
                players[i].explodedY = true;

                players[i].jumps = 2;
            }
        }


        this.Delete();
    }

    //Function that makes this block a floor
    MakeFloor() {
        this.isFloor = true;
        this.width = playWidth;
        this.height = gridSize * 2;
        this.x = playWidth / 2;
        this.y = playHeight - this.height / 2;

        //Make sure the players start sitting flush on the ground(the top of this block)
        for (var i = 0; i < players.length; i++) {
            players[i].y -= this.height;
        }

        this.color = "#000";
    }

    //Function to draw this block on the canvas
    Draw() {

        //If ths block has been hit change the color to white
        if (this.hit) {
            context.fillStyle = this.hitColor;
        }
        //Otherwise use the blocks regular color 
        else {
            context.fillStyle = this.color;
        }

        /*Draw the block offset by half its width and half its height
         * so that the block's coordinates correspond to the middle point of the block
        */
        context.fillRect((this.x - this.width / 2), (this.y - this.height / 2), this.width, this.height);

        if (this.deadly) {
            context.drawImage(skull, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
        else if (!this.hit) {
            switch (this.size) {
                case 0: //floor
                    context.drawImage(floorTexture, this.x - this.width / 2, this.y - this.height / 2, this.width, this.width / 1.38889);
                    break;
                case 1: //big
                    context.drawImage(blockBig, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;
                case 2: //half width
                    context.drawImage(blockTall, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;
                case 3: //half height
                    context.drawImage(blockFlat, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;
                case 4: //small
                    context.drawImage(blockBig, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;
                case 5:
                    context.drawImage(blockFlat, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;
                case 6:
                    context.drawImage(blockTall, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;
                case 7:
                    context.drawImage(blockTall, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    break;

            }
        }
        //If the block outline setting is enabled, draw a white outline around the block
        if (blockOutlines) {
            context.strokeStyle = "white";
            context.strokeRect((this.x - this.width / 2), (this.y - this.height / 2), this.width, this.height);
        }
    }

    //Function that calculates the blocks position and collisions this frame
    Update() {

        //If the block was hit increment the frame counter
        if (this.hit) {
            this.frameCounter++;
        }

        //After 20 frames, disable hit(stop flashing white)
        if (this.frameCounter >= 20) {
            this.hit = false;
        }

        //If the block is grounded set the block's speed to the speed of the game
        if (this.grounded) {
            this.vy = gameSpeed + 0.01;
        }

        //The block is falling so set the blocks speed to the block gravity value
        else {
            this.vy = blockGravity;
        }

        //If this isn't a platform, and this is not touching a platform
        if (!this.isPlatform && !this.hitPlatform) {
            //Fall
            this.y += blockGravity;
        }

        //If this is a platform and hasn't cleaned up yet
        else if (!this.platformed) {
            //For every block in the blocks array
            for (var i = 1; i < blocks.length; i++) {
                //If the current index block is this, or the current index block is null or the current index block is a platform
                if (blocks[i] == this || blocks[i] == null || blocks[i].isPlatform) {
                    //skip
                    continue;
                }
                //If the current index block is lower than this platform
                if (blocks[i].y > this.y + this.height) {
                    //delete it
                    blocks[i].Delete();
                }
            }

            //Set platformed to true (cleaned up)
            this.platformed = true;
            ReIndexBlocks();
        }

        //Reset grounded and platform collision each frame
        this.grounded = false;
        this.hitPlatform = false;

        //If the block is lower than the floor of the game, put the block flush on the floor
        if (this.y + this.height / 2 > playHeight + gameHeight) {
            this.y = playHeight + gameHeight - this.height / 2;
            this.grounded = true;
        }

        //If the block is out the right side of the game, put the block flush with the right edge of the canvas
        if (this.x + this.width / 2 > playWidth) {
            this.x = playWidth - this.width / 2;
        }

        //If the block is out the left side of the game, put the block flush with the left edge of the canvas
        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2;
        }

        //If this block is not a platform
        if (!this.isPlatform) {

            //Loop through every block in the blocks array
            for (var i = 0; i < blocks.length; i++) {

                //Skip if the current index block is this, or null
                if (blocks[i] == this || blocks[i] == null) {
                    continue;
                }

                //If this block has intersected with any other block:
                if (!((this.y - this.height / 2 >= blocks[i].y - 1 + blocks[i].height / 2) ||
                    (this.y + this.height / 2 <= blocks[i].y + 1 - blocks[i].height / 2) ||
                    (this.x - this.width / 2 >= blocks[i].x - 1 + blocks[i].width / 2) ||
                    (this.x + this.width / 2 <= blocks[i].x + 1 - blocks[i].width / 2))) {

                    //If this block just spawned, delete it
                    if (this.justSpawned) {
                        this.Delete();
                    }

                    //If the other block is a platform
                    if (blocks[i].isPlatform) {
                        this.hitPlatform = true;
                    }

                    //The other block is not a platform and we've collided
                    //so go back to the y position from last frame
                    else {
                        this.y = this.prevY;
                    }
                    this.grounded = true;

                    //If this is the first block to land this is not the floor, start the ascent of the game
                    if (!landed && !this.isFloor) {
                        landed = true;
                    }
                }
            }
        }

        /* if(this.justSpawned && (!this.isFloor && !this.isPlatform)){
             
             if(player1.y < 0){
                 if(this.y >= player1.y + player1.height){
                     this.Delete();
                 }
             }
             
         }*/

        //If the block has landed on something and was falling for more than 50 frames and the game is not over
        if (this.grounded && this.fallingFrameCounter > 50 && (!player1.died || (numPlayers == 2 && !gameover))) {

            //Play the landing sound
            var landSound = new Audio("sounds/land/land_" + Rand(0,5) + ".wav");
            landSound.volume = soundVolume;
            landSound.play();
        }

        //Once the block is on the ground reset the falling frame counter
        if (this.grounded) {
            this.fallingFrameCounter = 0;
        }


        //If the block is not standing on anything, increment the falling frame counter
        if (!this.grounded) {
            this.fallingFrameCounter++;
        }

        //Store the y position this frame to be used next frame
        this.prevY = this.y

        //Move this block down to simulate the game's ascent
        this.y += gameSpeed;

        //After the first frame, disabled justSpawned
        this.justSpawned = false;
    }
}

//The Player class
//Note: All forces and sizes are scaled using the sizeRatio to ensure gameplay is identical no matter the size of the display
class Player {

    //The static player number
    static playerNumber = 1;

    constructor() {

        //Set the number for this player and increment the static player number
        this.playerNumber = Player.playerNumber;
        Player.playerNumber++;

        this.width = gridSize * 0.9;//Set the width to 90% of the grid size to ensure the player will never get stuck in small spaces
        this.height = gridSize * 0.9;//Set the height to 90% of the grid size to ensure the player will never get stuck in small spaces

        this.gravity = 0.0098 * sizeRatio;//Gravity is (9.81 pixels/sec) / framerate(1000)

        this.facing = { left: true, right: false, up: false };//The direction the player is facing(used for shooting)

        this.frameCounter = 0;//Frame counter for hit animation

        this.hit = false;//Whether the player was hit by a bullet

        this.hitColor = "white";//The color to flash when hit by a bullet

        this.onBlock = false;//Whether the player is grinding or standing on a block

        this.onBlockSpeed = 0;//The speed of the player the player is grinding or standing on

        //If this is player 1, start the player at 1/3 the width of the canvas
        if (this.playerNumber == 1) {
            this.x = (playWidth / 3);
        }
        //This is player 2, start the player at 2/3 the width of the canvas
        else {
            this.x = (playWidth / 3) * 2;
        }

        this.y = playHeight - this.height / 2;//Start the player at the bottom of the canvas

        this.grounded = true; //Whether the player is standing on something

        this.fallingFrameCounter = 0;//Keeps track off how many frames the player has been falling for

        this.explodedX = false;

        this.explodedY = false;

        this.grind; //Whether the player is grinding

        this.grindFrameCounter = 0;//Keeps track off how many frames the player has been grinding for

        this.grindL = false; //Whether the player is grinding on the left

        this.grindR = false; //Whether the player is grinding on the right

        this.grindSound = new Audio("sounds/grind.mp3");//The sound to play when the player is grinding

        this.grindSound.volume = soundVolume;

        this.speed = 0.05 * sizeRatio; //The players movement speed

        this.maxSpeed = 1 * sizeRatio;//The players max velocity

        this.bulletSpeed = 2 * sizeRatio;//The speed to shoot the bullets

        this.attackChargeFrameCounter = 0;

        this.maxCharge = 1000;

        this.charged = false;

        this.jumpForce = 1.33 * sizeRatio; //The players jump force

        this.jump = false; //Wether the player should jump or not

        this.jumped = false //Whether the player has jumped

        this.jumps = 2; //Amount of jumps the player is allowed to make without landing

        this.attacked = false;//Whether the the player has attacked

        this.died = false;//Whether the player has died

        //If this is player 1, set the color to the player1 color
        if (this.playerNumber == 1) {
            this.color = p1Color
        }
        //This is player 2, set the color to the player2 color
        else {
            this.color = p2Color;
        }

        //If this is player 1, set the controls accordingly
        if (this.playerNumber == 1) {
            //                       A         D         W        S        'Space'
            this.controls = { left: 65, right: 68, jump: 87, down: 83, shoot: 32 };
        }

        //This is player 2, set the controls accordingly 
        else {
            //                     Left      Right       Up       Down        0
            this.controls = { left: 37, right: 39, jump: 38, down: 40, shoot: 96 };
        }

        this.leftButtonDown = false;
        this.rightButtonDown = false;
        this.jumpButtonDown = false;
        this.shootButtonDown = false;

        this.vx = 0; //The players horizontal velocity
        this.vy = 0; //The players vertical velocity

        //Object containing which directions the player has collided in
        this.collisionDirection = { top: false, bottom: false, left: false, right: false };
    }

    //Function to draw the player
    Draw() {

        //If ths player has been hit change the color to white
        if (this.hit) {
            context.fillStyle = this.hitColor;
        }

        //Otherwise use the blocks regular color 
        else {
            context.fillStyle = this.color;
        }

        //If the player hasn't died
        if (!this.died) {

            /*Draw the player offset by half their width and half their height
             * so that the player's coordinates correspond to their middle point
            */
            context.fillRect((this.x - this.width / 2), (this.y - this.height / 2), this.width, this.height);

            //If the player is facing left
            if (this.facing.left) {
                //Draw a little box to the left of the player to represent a blaster
                let gx = (this.x - this.width / 2 - this.width / 3);
                let gy = (this.y - this.height / 8) - ((this.attackChargeFrameCounter / this.maxCharge) * (this.height - this.height / 4)) / 2;
                let gwidth = this.width / 4;
                let gheight = this.height / 4 + ((this.attackChargeFrameCounter / this.maxCharge) * (this.height - this.height / 4));

                context.fillRect(gx, gy, gwidth, gheight);

                context.drawImage(glassesLeft, this.x - this.width / 2, this.y - this.height / 3, this.width, this.width / 4.1212);
            }

            //If the player is facing right
            if (this.facing.right) {

                //Draw a little box to the left of the player to represent a blaster
                let gx = (this.x + this.width / 2 + this.width / 12);
                let gy = (this.y - this.height / 8) - ((this.attackChargeFrameCounter / this.maxCharge) * (this.height - this.height / 4)) / 2;
                let gwidth = this.width / 4;
                let gheight = this.height / 4 + ((this.attackChargeFrameCounter / this.maxCharge) * (this.height - this.height / 4));

                context.fillRect(gx, gy, gwidth, gheight);

                context.drawImage(glassesRight, this.x - this.width / 2, this.y - this.height / 3, this.width, this.width / 4.1212);

            }

            //If the player is facing up
            if (this.facing.up) {

                let gx = (this.x - this.width / 8) - ((this.attackChargeFrameCounter / this.maxCharge) * (this.height - this.height / 4)) / 2;
                let gy = (this.y - this.height / 2 - this.height / 2);
                let gwidth = this.width / 4 + ((this.attackChargeFrameCounter / this.maxCharge) * (this.width - this.width / 4));
                let gheight = this.height / 4;

                //Draw a little box on top of the player to represent a blaster
                context.fillRect(gx, gy, gwidth, gheight);

                context.drawImage(glassesUp, this.x - this.width / 2, this.y - this.height / 3, this.width, this.width / 4.1212);

            }
            //context.fillText(this.attackChargeFrameCounter, this.x - highscoreSize / 2, this.y - this.height / 1.5);

            //If the game is 2 player
            if (numPlayers == 2) {

                //Display text showing player number above the player
                context.font = highscoreSize + "px bit";
                if (this.playerNumber == 1) {
                    context.fillText("P1", this.x - highscoreSize / 2, this.y - this.height / 1.5);
                }
                else {
                    context.fillText("P2", this.x - highscoreSize / 2, this.y - this.height / 1.5);
                }
            }

            //If the player goes up and out of the canvas
            if (this.y + this.height / 2 < 0) {

                //Display text showing player number at the top of the screen
                //and at the players X coordinate so that the player knows where they will land
                context.font = highscoreSize + "px bit";
                if (this.playerNumber == 1) {
                    context.fillText("P1", this.x - highscoreSize, highscoreSize);
                }
                else {
                    context.fillText("P2", this.x - highscoreSize, highscoreSize);
                }
            }
        }
    }

    //Function for the players attack
    Attack() {

        //If the player hasn't attacked
        if (!this.attacked && !this.died) {

            this.attacked = true;//The player has now attacked

            //If the player is facing left
            if (this.facing.left) {

                //Create a bullet and shoot it to the left of the player 
                bullets.push(new Bullet(this.x - this.width / 2, this.y, -this.bulletSpeed, 0, this.color, this.attackChargeFrameCounter, this));
            }

            //If the player is facing right
            if (this.facing.right) {

                //Create a bullet and shoot it to the left of the player 
                bullets.push(new Bullet(this.x + this.width / 2, this.y, this.bulletSpeed, 0, this.color, this.attackChargeFrameCounter, this));
            }

            //If the player is facing left
            if (this.facing.up) {

                //Create a bullet and shoot it upwards of the player 
                bullets.push(new Bullet(this.x, this.y - this.height / 2, 0, -this.bulletSpeed, this.color, this.attackChargeFrameCounter, this));
            }

            if (this.attackChargeFrameCounter >= this.maxCharge) {
                //Play the shoot sound
                var shootSound = new Audio("sounds/charge_shot.wav");
                shootSound.volume = soundVolume;
                shootSound.play();
            } else {
                //Play the shoot sound
                var shootSound = new Audio("sounds/shoot.wav");
                shootSound.volume = soundVolume;
                shootSound.play();
            }
            if (this.playerNumber == 1 && !chargeSound1.paused) {
                chargeSound1.pause();
                chargeSound1.currentTime = 0;
            }
            else if (!chargeSound2.paused) {
                chargeSound2.pause();
                chargeSound2.currentTime = 0;
            }
        }
    }

    //Function dealing with this player being hit by a bullet
    Hit() {
        this.hit = true;

        this.frameCounter = 0;//Reset the frame counter

        this.jumps = 2;//Reset jumps allowed

        //Play hit sound
        var hitSound = new Audio("sounds/block_hit.wav");
        hitSound.volume = soundVolume;
        hitSound.play();
    }

    //Function that calculates collision detection and the players movement
    Update() {

        //If the player was hit increment the frame counter
        if (this.hit) {
            this.frameCounter++;
        }

        //After 20 frames, disable hit(stop flashing white)
        if (this.frameCounter >= 20) {
            this.hit = false;
        }

        //If the player has fallen below the bottom of the screen
        if (this.y - this.height / 2 >= playHeight) {

            //If this is the first frame that the player has died
            if (!this.died) {

                //Play the death sound
                var dieSound = new Audio("sounds/death.wav");
                dieSound.volume = soundVolume;
                dieSound.play();
            }
            this.died = true;
        }

        //If the player is falling
        if (!this.grounded) {

            //If the player is grinding and their vertical velocity is greater than zero
            if ((((this.grindL && (keyMap[this.controls.left] || this.leftButtonDown)) || (this.grindR && (keyMap[this.controls.right] || this.rightButtonDown))) && this.onBlock) && this.vy >= 0 && !this.collisionDirection.top) {

                //Set the players vertical velocity to that of the block the player is standing or grinding on
                this.vy = this.onBlockSpeed;

                //If the grind sound isn't already playing and the player has been in the air for at least 50 frames
                if (this.grindSound.paused && this.fallingFrameCounter > 50) {

                    //Play it
                    this.grindSound.play();
                }
            }

            //Otherwise add gravity to the players vertical velocity
            else {
                this.vy += this.gravity;
                if (!this.grindSound.paused) {
                    //Not grinding so stop and reset the grind sound
                    this.grindSound.pause();
                    this.grindSound.currentTime = 0;
                }
            }
        }



        //If the player is pressing their right button
        if ((keyMap[this.controls.right] || this.rightButtonDown) && !keyMap[this.controls.down]) {

            //If the player is not at their max speed
            if (this.vx < this.maxSpeed) {

                //Increase their horizontal velocity
                this.vx += this.speed;
            }
        }

        //If the player is pressing their left button
        if ((keyMap[this.controls.left] || this.leftButtonDown) && !keyMap[this.controls.down]) {

            //If the player is not at their max speed
            if (this.vx > -this.maxSpeed) {

                //Increase their horizontal velocity
                this.vx -= this.speed;
            }
        }

        //If the player jumps and they are standing or grinding on something or they have another jump available and they have not collided upwards
        if (this.jump && (this.grounded || this.grind || this.jumps > 0) && !this.collisionDirection.top && this.y > -gridSize / 2) {

            this.jumps--;//Remove an available jump

            this.jump = false;//Disable jumping

            //If the player is grinding when they jumped
            if (this.grind) {

                //Invert and increase their horizontal speed to jump away from the block 
                this.vx *= -1;

                //Jump with 40% more force to counter-act the downward force of the grind
                this.vy -= this.jumpForce * 1.5;
            } else {
                this.vy -= this.jumpForce;
            }

            //Play the jump sound
            jumpSound.play();
        }

        //If the player is not pressing their left or right button
        if ((!keyMap[this.controls.left] && !this.leftButtonDown) && (!keyMap[this.controls.right] && !this.rightButtonDown)) {

            //Reduce their horizontal speed by 10%
            this.vx *= 0.9;
        }

        //Cap the players upwards momentum to their jump force
        if (this.vy < -this.jumpForce) {
            this.vy = -this.jumpForce;
        }

        //Reset all collision variables each frame
        this.grounded = false;
        this.grind = false;
        this.grindL = false;
        this.grindR = false;
        this.onBlock = false
        this.collisionDirection = { top: false, bottom: false, left: false, right: false };

        //Calculate the players new X and Y position this frame
        this.newX = this.x + this.vx;
        this.newY = this.y + this.vy;

        //If the player is touching the canvas floor, they are grounded
        if (this.y + this.height / 2 >= playHeight + gameHeight) {
            this.grounded = true;
        }



        //#region Charge Attack

        if (keyMap[this.controls.shoot] && !this.charged) {
            this.attackChargeFrameCounter += 4;

            if (this.attackChargeFrameCounter >= this.maxCharge) {
                if (this.playerNumber == 1 && !chargeSound1.paused) {
                    chargeSound1.pause();
                    chargeSound1.currentTime = 0;
                }
                else if (!chargeSound2.paused) {
                    chargeSound2.pause();
                    chargeSound2.currentTime = 0;
                }
            }
            else {
                if (this.playerNumber == 1) {
                    if (chargeSound1.paused) {
                        chargeSound1.play();
                    }
                }
                else {
                    if (chargeSound2.paused) {
                        chargeSound2.play();
                    }
                }
            }

            this.attackChargeFrameCounter = Math.min(this.attackChargeFrameCounter, this.maxCharge);


        }

        //#endregion


        //#region Block Collision

        //Loop through all the blocks in the blocks array
        for (var i = 0; i < blocks.length; i++) {

            //Skip if the block is null
            if (blocks[i] == null) {
                continue;
            }

            //Vertical collision detection: The player will intersect with an object at their new Y position
            if (!((this.newY - this.height / 2 >= blocks[i].y + blocks[i].height / 2) ||
                (this.newY + this.height / 2 <= blocks[i].y - blocks[i].height / 2) ||
                (this.x - this.width / 2 >= blocks[i].x + blocks[i].width / 2) ||
                (this.x + this.width / 2 <= blocks[i].x - blocks[i].width / 2))) {

                //The collision is on the bottom of the player
                if (this.y < blocks[i].y) {

                    this.collisionDirection.bottom = true;

                    this.grounded = true;

                    this.jumps = 2;//Reset the players jumps

                    this.vy = 0;//Set the players vertical velocity to 0(the player will not move downwards)

                }

                //The collision is on the top of the player
                if (this.y > blocks[i].y) {

                    this.collisionDirection.top = true;

                    //Move the player down by twice the speed of the block gravity
                    this.y += blockGravity * 2;

                    this.vy += this.gravity;
                    //this.vy *= -1;

                    //this.jumps = 2;

                    //If the player is standing on something when something lands on them
                    if (this.grounded) {

                        //If this is the first frame that the player died
                        if (!this.died) {
                            //Play the death sound
                            var dieSound = new Audio("sounds/death.wav");
                            dieSound.volume = soundVolume;
                            dieSound.play();
                        }
                        this.died = true;
                    }
                }
                if (this.explodedY) {
                    this.vy = 0;
                    this.explodedY = false;
                }
            }
            //Horizontal collision detection: The player will intersect with an object at their new X position
            if (!((this.y - this.height / 2 >= blocks[i].y + blocks[i].height / 2) ||
                (this.y + this.height / 2 <= blocks[i].y - blocks[i].height / 2) ||
                (this.newX - this.width / 2 >= blocks[i].x + blocks[i].width / 2) ||
                (this.newX + this.width / 2 <= blocks[i].x - blocks[i].width / 2))) {

                //The collision is on the right of the player
                if (this.x < blocks[i].x) {
                    this.collisionDirection.right = true;
                    this.grindR = true;

                }

                //The collision is on the left of the player
                if (this.x > blocks[i].x) {
                    this.collisionDirection.left = true;
                    this.grindL = true;
                }

                //this.vx = 0;
                if (!this.collisionDirection.top) {
                    this.onBlock = true;
                    this.onBlockSpeed = blocks[i].vy + gameSpeed;//Set the onBlockSpeed to the current index blocks velocity               
                    this.jumps = 2;//Reset the players jumps
                    this.grind = true;
                }

                if (this.explodedX) {
                    this.vx = 0;
                    this.explodedX = false;
                }
            }
        }
        //#endregion

        //#region Player collision

        //If player collision is on
        if (playerCollision) {

            //There is more than 1 player
            if (players.length > 1) {

                let otherPlayer = null;//The other player to check collisions against

                //If this is player 1, set otherPlayer to player2
                if (this.playerNumber == 1) {
                    otherPlayer = players[1];
                }

                //This is player 2, set otherPlayer to player1
                else {
                    otherPlayer = players[0];
                }

                //If the other player hasn't died
                if (!otherPlayer.died) {

                    //Vertical collision detection: The player will intersect with the other player at their new Y position
                    if (!((this.newY - this.height / 2 >= otherPlayer.y + otherPlayer.height / 2) ||
                        (this.newY + this.height / 2 <= otherPlayer.y - otherPlayer.height / 2) ||
                        (this.x - this.width / 2 >= otherPlayer.x + otherPlayer.width / 2) ||
                        (this.x + this.width / 2 <= otherPlayer.x - otherPlayer.width / 2))) {

                        //The collision is on the bottom of the player
                        if (this.y < otherPlayer.y) {
                            this.collisionDirection.bottom = true;

                            this.grounded = true;
                            this.jumps = 2;//Reset the players jumps
                            this.vy = 0;//Set the players vertical velocity to 0(the player will not move downwards)
                        }

                        //The collision is on the top of the player
                        if (this.y > otherPlayer.y) {
                            this.collisionDirection.top = true;
                        }
                    }

                    //Horizontal collision detection: The player will intersect with the other player at their new X position
                    if (!((this.y - this.height / 2 >= otherPlayer.y + otherPlayer.height / 2) ||
                        (this.y + this.height / 2 <= otherPlayer.y - otherPlayer.height / 2) ||
                        (this.newX - this.width / 2 >= otherPlayer.x + otherPlayer.width / 2) ||
                        (this.newX + this.width / 2 <= otherPlayer.x - otherPlayer.width / 2))) {

                        //The collision is on the right of the player
                        if (this.x < otherPlayer.x) {
                            this.collisionDirection.right = true;
                            this.jumps = 2;//Reset the players jumps
                        }

                        //The collision is on the left of the player
                        if (this.x > otherPlayer.x) {
                            this.collisionDirection.left = true;
                            this.jumps = 2;//Reset the players jumps
                        }
                    }
                }
            }
            //#endregion
        }

        //If the player hasn't died
        if (!this.died) {

            //If the player won't collide with anything at their new X position
            if (!this.collisionDirection.left && !this.collisionDirection.right) {

                //Allow the move to the new X position
                this.x += this.vx;
            }

            //If the player won't collide with anything at their new Y position
            if (!this.collisionDirection.top) {

                //Allow the move to the new Y position
                this.y += this.vy;
            }
        }

        //If the block goes below the floor of the canvas
        if (this.y + this.height / 2 >= playHeight + gameHeight) {

            //Place the player on the floor of the canvas
            this.y = playHeight + gameHeight - this.height / 2;
            this.grounded = true;

            this.jumps = 2;//Reset the players jump
            this.vy = 0;//Set the players vertical velocity to zero
        }

        //If the player is out the right side of the canvas
        if (this.x + this.width / 2 > playWidth) {

            //Place the player flush with the right edge of the canvas
            this.x = playWidth - this.width / 2;
        }

        //If the player is out the left side of the canvas
        if (this.x - this.width / 2 < 0) {

            //Place the player flush with the left edge of the canvas
            this.x = this.width / 2;
        }


        //If the player has landed something and was falling for more than 50 frames and the game is not over
        if (this.grounded && this.fallingFrameCounter > 50 && (!player1.died || (numPlayers == 2 && !gameover))) {

            //Play the landing sound
            var landSound = new Audio("sounds/player_land.wav");
            landSound.volume = soundVolume;
            landSound.play();
        }

        //Once the player is on the ground reset the falling frame counter
        if (this.grounded) {
            this.fallingFrameCounter = 0;
        }

        //If the player is not standing on anything, increment the falling frame counter
        if (!this.grounded) {
            this.fallingFrameCounter++;
        }

        //This is player 1
        if (this.playerNumber == 1) {

            //If the player score this frame is greater than their current game score
            if ((playHeight + gameHeight - this.y - this.height / 2 - gridSize * 2) / sizeRatio > p1Score) {

                //Set the players current game score to their current frame score
                p1Score = (playHeight + gameHeight - this.y - this.height / 2 - gridSize * 2) / sizeRatio;

                //If the players current game score is higher than the highscore
                if (p1Score > highscore && !this.died) {
                    highscore = p1Score;//set the highscore to the players score
                    scoreSound1.play();//Play the score sound
                    scoreSound1.volume = soundVolume;
                }
            }

            //The players score this frame is not greater than their current game score
            else {
                //Stop the score sound
                scoreSound1.volume *= 0.9;
                if (scoreSound1.volume <= 0.1) {
                    scoreSound1.pause();
                    scoreSound1.volume = soundVolume;
                }
            }
        }

        //This is player 2
        else {
            if ((playHeight + gameHeight - this.y - this.height / 2 - gridSize * 2) / sizeRatio > p2Score) {

                //Set the players current game score to their current frame score
                p2Score = (playHeight + gameHeight - this.y - this.height / 2 - gridSize * 2) / sizeRatio;

                //If the players current game score is higher than the highscore
                if (p2Score > highscore && !this.died) {
                    highscore = p2Score;//set the highscore to the players score
                    scoreSound2.play();//Play the score sound
                    scoreSound2.volume = soundVolume;

                }
            }

            //The players score this frame is not greater than their current game score
            else {
                //Stop the score sound

                scoreSound2.volume *= 0.9;
                if (scoreSound2.volume <= 0.1) {
                    scoreSound2.pause();
                    scoreSound2.volume = soundVolume;
                }
            }
        }
    }
}

//Bullet Class
class Bullet {
    constructor(x, y, vx, vy, color, charge, player) {

        this.x = x;
        this.y = y;

        this.vx = vx;//The bullet's horizontal velocity
        this.vy = vy//The bullet's vertical velocity

        this.charge = charge;

        //If the bullet's x velocity is 0(shot upwards)
        if (vx == 0) {

            //Move the bullet so it is shot from the middle of the player and elongated upwards
            this.width = gridSize / 4 + player.attackChargeFrameCounter / 45;
            this.height = gridSize / 2 + player.attackChargeFrameCounter / 45;
            this.x -= this.width / 2;
            this.y -= this.height / 2;
        }

        //The bullet's x velocity is > 0(shot horizontaly)
        else {
            //Make the bullet elongated sideways
            this.width = gridSize / 2 + player.attackChargeFrameCounter / 45;
            this.height = gridSize / 4 + player.attackChargeFrameCounter / 45;
        }

        //Set the array index of this bullet
        this.index = bullets.length;

        this.color = color;

        //Move the bullet away from the player so it doesnt collide right away
        if (vx < 0) {
            this.x -= this.width / 2;
        } else {
            this.x += this.width / 2;
        }
    }

    //Function to calculate the bullets position and if it hit something
    Update() {

        //Add velocity to the bullet's position
        this.x += this.vx;
        this.y += this.vy;


        //If the bullet goes out the top of the canvas
        if (this.y - this.height / 2 < -200) {
            //Delete it
            delete bullets[this.index];
        }

        //If the bullet goes out the right of the canvas
        if (this.x - this.width / 2 > playWidth) {

            //Delete it
            delete bullets[this.index];
        }

        //If the bullet goes out the left of the canvas
        if (this.x + this.width / 2 < 0) {

            //Delete it
            delete bullets[this.index];
        }

        //Loop throught every block in the blocks array
        for (var i = 0; i < blocks.length; i++) {

            //Skip if the block is null
            if (blocks[i] == null) {
                continue;
            }

            //If the bullet intersects with any blocks this frame
            if (!((this.y - this.height / 2 >= blocks[i].y + blocks[i].height / 2) ||
                (this.y + this.height / 2 <= blocks[i].y - blocks[i].height / 2) ||
                (this.x - this.width / 2 >= blocks[i].x + blocks[i].width / 2) ||
                (this.x + this.width / 2 <= blocks[i].x - blocks[i].width / 2))) {

                //Tell the block it was hit
                blocks[i].Hit(this);

                //Delete this bullet
                if (this.charge <= 50) {
                    delete bullets[this.index];
                }
                else {
                    this.charge -= 20;
                }
            }
        }

        //If friendly fire is on
        if (friendlyFire) {

            //Loop through all the players
            for (var i = 0; i < players.length; i++) {

                //If the bullet intersects with any players this frame
                if (!((this.y - this.height / 2 >= players[i].y + players[i].height / 2) ||
                    (this.y + this.height / 2 <= players[i].y - players[i].height / 2) ||
                    (this.x - this.width / 2 >= players[i].x + players[i].width / 2) ||
                    (this.x + this.width / 2 <= players[i].x - players[i].width / 2))) {

                    //Tell the player they were hit
                    players[i].Hit();

                    //Transfer this bullets velocity to the player
                    players[i].vx += this.vx;
                    players[i].vy += this.vy;

                    //Delete this bullet
                    if (this.charge <= 50) {
                        delete bullets[this.index];
                    }
                    else {
                        this.charge -= 20;
                    }
                }
            }
        }
    }

    //Function to draw the bullet
    Draw() {

        //Draw the bullet
        context.fillStyle = this.color;
        context.fillRect((this.x - this.width / 2), (this.y - this.height / 2), this.width, this.height);
    }
}

//High Score class
class HighScore {
    constructor(name, score) {

        this.name = name;//Name of the player
        this.score = score;//The score
        this.y = 0;//The position this score will be in the game
    }

    //Function to draw the highscore
    Draw() {

        //Calculate the Y position of the high score scaled witht the size ratio
        this.y = (playHeight + gameHeight - player1.height - blocks[0].height - this.score * sizeRatio);

        //Draw the high score
        context.fillStyle = "#215c9c";
        context.strokeStyle = "#000";
        context.lineWidth = 0.5 * sizeRatio;
        context.font = highscoreSize + "px bit";

        context.fillRect(0, this.y, playWidth, 1 * sizeRatio);//The high score line
        context.fillText(this.name + " - " + this.score, (playWidth / 8), this.y - 5 * sizeRatio);//The players name and score

    }
}

//Functionality when a key is pressed
document.addEventListener('keydown', function (event) {

    //If the music is not playing(the game just started)
    if (document.getElementById("music").paused && !paused) {
        //Play the music
        document.getElementById("music").volume = musicVolume;
        document.getElementById("music").play();
    }
    if (event.key == "Escape" && (!player1.died || (numPlayers == 2 && !player2.died))) {

        TogglePause();
    }

    //#region Player 1 Controls 

    //If the key pressed was player1's jump key
    if (event.keyCode == player1.controls.jump) {

        //The player is facing up
        player1.facing.left = false;
        player1.facing.right = false;
        player1.facing.up = true;

        if (player1.attackChargeFrameCounter > 0 && !keyMap[player1.controls.down]) {

            player1.charged = true;
            player1.attackChargeFrameCounter = 0;
            chargeSound1.pause();
            chargeSound1.currentTime = 0;

        }

        //If player1 has not jumped
        if (!player1.jumped && !keyMap[player1.controls.down]) {

            //If player1 has jumps remaining
            if (player1.jumps > 0) {

                //Tell player1 to jump
                player1.jump = true;
                player1.jumped = true;
            }
        }
    }

    //If the key pressed was player1's left key
    if (event.keyCode == player1.controls.left) {

        if (player1.attackChargeFrameCounter > 0 && !keyMap[player1.controls.down]) {

            player1.charged = true;
            player1.attackChargeFrameCounter = 0;
            chargeSound1.pause();
            chargeSound1.currentTime = 0;
        }

        //The player is facing left
        player1.facing.left = true;
        player1.facing.right = false;
        player1.facing.up = false;

    }

    //If the key pressed was player1's right key
    if (event.keyCode == player1.controls.right) {

        if (player1.attackChargeFrameCounter > 0 && !keyMap[player1.controls.down]) {
            player1.charged = true;
            player1.attackChargeFrameCounter = 0;
            chargeSound1.pause();
            chargeSound1.currentTime = 0;
        }

        //The player is facing right
        player1.facing.left = false;
        player1.facing.right = true;
        player1.facing.up = false;

    }
    //If the key pressed was player1's shoot key
    if (event.keyCode == player1.controls.shoot) {

        //If the player isn't dead
        if (!player1.died) {
            //Shoot
            player1.Attack();
        }
    }
    //#endregion

    //#region Player 2 Controls 
    //If there are 2 players
    if (numPlayers == 2) {
        //If the key pressed was player2's jump key
        if (event.keyCode == player2.controls.jump) {

            if (player2.attackChargeFrameCounter > 0 && !keyMap[player2.controls.down]) {
                player2.charged = true;
                player2.attackChargeFrameCounter = 0;
                chargeSound2.pause();
                chargeSound2.currentTime = 0;
            }

            //The player is facing up
            player2.facing.left = false;
            player2.facing.right = false;
            player2.facing.up = true;

            //If player2 has not jumped
            if (!player2.jumped && !keyMap[player2.controls.down]) {

                //If player2 has jumps remaining
                if (player2.jumps > 0) {

                    //Tell player2 to jump
                    player2.jump = true;
                    player2.jumped = true;
                }
            }
        }

        //If the key pressed was player2's left key
        if (event.keyCode == player2.controls.left) {

            if (player2.attackChargeFrameCounter > 0 && !keyMap[player2.controls.down]) {
                player2.charged = true;
                player2.attackChargeFrameCounter = 0;
                chargeSound2.pause();
                chargeSound2.currentTime = 0;
            }

            //The player is facing left
            player2.facing.left = true;
            player2.facing.right = false;
            player2.facing.up = false;
        }

        //If the key pressed was player2's right key
        if (event.keyCode == player2.controls.right) {

            if (player2.attackChargeFrameCounter > 0 && !keyMap[player2.controls.down]) {
                player2.charged = true;
                player2.attackChargeFrameCounter = 0;
                chargeSound2.pause();
                chargeSound2.currentTime = 0;
            }

            //The player is facing right
            player2.facing.left = false;
            player2.facing.right = true;
            player2.facing.up = false;
        }

        //If the key pressed was player2's shoot key
        if (event.keyCode == player2.controls.shoot) {

            //If the player isn't dead
            if (!player2.died) {

                //Shoot
                player2.Attack();
            }
        }
    }
    //#endregion

    //Store the state of key that was released in the map (true = pressed, false = released)
    keyMap[event.keyCode] = true;
});

//Functionality when a key is released
document.addEventListener('keyup', function (event) {

    //#region Player 1 Controls

    //If the key pressed was player1's right jump
    if (event.keyCode == player1.controls.jump) {

        //Allow the player to jump again
        player1.jumped = false;
    }

    //If the key pressed was player1's shoot key
    if (event.keyCode == player1.controls.shoot) {

        //Allow the player to attack again
        player1.attacked = false;
        if (player1.attackChargeFrameCounter > 0) {
            if (!player1.charged) {
                player1.Attack();

            }
            player1.attackChargeFrameCounter = 0;
        }

        player1.charged = false;
    }

    //#endregion

    //#region Player 2 Controls
    //If there are 2 players
    if (numPlayers == 2) {

        //If the key pressed was player2's right jump
        if (event.keyCode == player2.controls.jump) {

            //Allow the player to jump again
            player2.jumped = false;
        }

        //If the key pressed was player2's shoot key
        if (event.keyCode == player2.controls.shoot) {

            //Allow the player to attack again
            player2.attacked = false;
            if (player2.attackChargeFrameCounter > 0) {
                if (!player2.charged) {
                    player2.Attack();

                }
                player2.attackChargeFrameCounter = 0;
            }

            player2.charged = false;
        }
    }
    //#endregion

    //Store the state of key that was released in the map (true = pressed, false = released)
    keyMap[event.keyCode] = false;

});



leftButton.addEventListener("touchstart", function () {

    //If the music is not playing(the game just started)
    if (document.getElementById("music").paused) {
        //Play the music
        document.getElementById("music").volume = musicVolume;
        document.getElementById("music").play();
    }

    if (numPlayers == 1) {
        //The player is facing left
        player1.facing.left = true;
        player1.facing.right = false;
        player1.facing.up = false;

        player1.leftButtonDown = true;
    }

});

leftButton.addEventListener("touchend", function () {

    if (numPlayers == 1) {
        player1.leftButtonDown = false;
    }

});


rightButton.addEventListener("touchstart", function () {

    //If the music is not playing(the game just started)
    if (document.getElementById("music").paused) {
        //Play the music
        document.getElementById("music").volume = musicVolume;
        document.getElementById("music").play();
    }


    if (numPlayers == 1) {

        //The player is facing right
        player1.facing.left = false;
        player1.facing.right = true;
        player1.facing.up = false;

        player1.rightButtonDown = true;
    }

});

rightButton.addEventListener("touchend", function () {

    if (numPlayers == 1) {
        player1.rightButtonDown = false;
    }

});


jumpButton.addEventListener("touchstart", function () {

    //If the music is not playing(the game just started)
    if (document.getElementById("music").paused) {
        //Play the music
        document.getElementById("music").volume = musicVolume;
        document.getElementById("music").play();
    }


    if (numPlayers == 1) {

        //The player is facing up
        player1.facing.left = false;
        player1.facing.right = false;
        player1.facing.up = true;

        //If player1 has not jumped
        if (!player1.jumped) {

            //If player1 has jumps remaining
            if (player1.jumps > 0) {

                //Tell player1 to jump
                player1.jump = true;
                player1.jumped = true;
            }
        }
    }

});

jumpButton.addEventListener("touchend", function () {

    if (numPlayers == 1) {
        //Allow the player to jump again
        player1.jumped = false;
    }

});

shootButton.addEventListener("touchstart", function () {

    //If the music is not playing(the game just started)
    if (document.getElementById("music").paused) {
        //Play the music
        document.getElementById("music").volume = musicVolume;
        document.getElementById("music").play();
    }


    if (numPlayers == 1) {

        //If the player isn't dead
        if (!player1.died) {

            //Shoot
            player1.Attack();
        }
    }

});

shootButton.addEventListener("touchend", function () {

    if (numPlayers == 1) {
        //Allow the player to jump again
        player1.attacked = false;
    }

});

function TogglePause() {

    if (paused) {
        paused = false;
        //Start the frame re-draw
        timeout = setInterval(Draw, refreshRate);
        //Start the block spawner
        setTimeout(CreateBlock, spawnRate);

        //Blur the game
        canvas.style.filter = "blur(0px)";
        if (!pauseMenu.classList.contains("hidden")) {
            pauseMenu.classList.toggle("hidden");
        }
        if (document.getElementById("music").paused && !paused) {
            //Play the music
            document.getElementById("music").volume = musicVolume;
            document.getElementById("music").play();
        }
    }
    else {

        paused = true;
        Stop();

        //Stop the music           
        document.getElementById("music").pause();

        player1.grindSound.pause();
        player1.grindSound.currentTime = 0;

        scoreSound1.pause();

        if (numPlayers == 2) {
            player2.grindSound.pause();
            player2.grindSound.currentTime = 0;
            scoreSound2.pause();
        }

        //Blur the game
        canvas.style.filter = "blur(3px)";

        //Center the form in the window
        pauseMenu.style.left = window.innerWidth / 2 - pauseMenu.scrollWidth / 2 + "px";

        if (pauseMenu.classList.contains("hidden")) {
            pauseMenu.classList.toggle("hidden");
        }
        pauseMenu.style.left = window.innerWidth / 2 - pauseMenu.scrollWidth / 2 + "px";


    }
}


//Function that initializes the game and all variables
function Initialize() {

    //Make sure the submit score form is hidden
    if (!submitScoreForm.classList.contains("hidden")) {
        submitScoreForm.classList.toggle("hidden");
    }

    //If the music is not playing(the game just started)
    if (document.getElementById("music").paused) {
        //Play the music
        document.getElementById("music").volume = musicVolume;
        document.getElementById("music").play();
    }


    //Un-blur the game
    canvas.style.filter = "blur(0px)";

    //Stop the game if it is running
    Stop();

    //Start the frame re-draw
    timeout = setInterval(Draw, refreshRate);

    //Reset the block and player ids
    Block.blockID = 1;
    Player.playerNumber = 1;

    gameSpeed = 0;//The speed that the game ascends
    spawnRate = 150;//The interval between block spawns(ms)
    keyMap = {};//The object that will hold the key's and their states
    blockGravity = 0.8 * sizeRatio;//The speed at which the blocks fall(scaled by size ratio)
    gameHeight = 0;//How much that game has 'ascended'
    landed = false;//Whether the first block has landed(starts the game)

    paused = false;
    currentMusicTime = 0;

    p1Score = 0;//Player 1's score
    p2Score = 0;//Player 2's score
    highscore = 0;//The current game's highscore
    scoreText = "";//The text that will show the current score

    scoreSize = 50 * sizeRatio;//The font size of the score text(scaled by size ratio)
    highscoreText = "High Score";//The text displayed on the high score bar
    highscoreSize = 18 * sizeRatio;//The font size of the high score text(scaled by size ratio)

    platformedframeCounter = 0;//The frame counter for creating platforms

    gameover = false;//Whether the game is over

    //If there is a high score saved in the session storage
    if (sessionStorage.getItem("highscore") != null) {

        //Set the players high score to the session storage highscore
        currentHighscore = parseInt(sessionStorage.getItem("highscore"));
    }
    //There is no score in session storage
    else {

        //Reset current highscore
        currentHighscore = 0;
    }

    skyWidth = playWidth;//Width of the sky background
    skyHeight = playWidth;//Height of the sky background

    sky = document.getElementById("sky");//The sky image
    glassesLeft = document.getElementById("glasses_left");
    glassesRight = document.getElementById("glasses_right");
    glassesUp = document.getElementById("glasses_up");
    skull = document.getElementById("skull");
    blockBig = document.getElementById("block_big");
    blockFlat = document.getElementById("block_flat");
    blockTall = document.getElementById("block_tall");
    floorTexture = document.getElementById("floor");

    skyY1 = 0;//The starting position of the first sky image
    skyY2 = -skyHeight;//The starting position of the second sky image(starts on top of the first sky to create a seamlessly tiled sky)



    //Create the arrays for the blocks, bullets, players, and high scores
    blocks = new Array();
    bullets = new Array();
    players = new Array();
    highscores = new Array();

    //Start the block spawner
    setTimeout(CreateBlock, spawnRate);

    //Create player 1
    players.push(new Player());
    player1 = players[0];

    //If the game was set to 2 player
    if (numPlayers == 2) {

        //Create player 2
        players.push(new Player());
        player2 = players[1];
    }

    //Add a block and make it the floor
    blocks.push(new Block(Rand(1, playWidth / gridSize), 0, 0));
    blocks[0].MakeFloor();

    //Loop throught the high scores that we got from the database in game.php
    for (var i = 0; i < highScores.length; i++) {
        //Create a new high score object and add it to the array
        highscores.push(new HighScore(highScores[i]["name"], highScores[i]["score"]));
    }
}

//Block spawner function
function CreateBlock() {
    //Create a new block and add it to the array
    blocks.push(new Block(Rand(1, playWidth / gridSize), 0, Rand(1, 6)));

    //Call this function again after the set spawn interval and store the timeout id
    spawnTimeout = setTimeout(CreateBlock, spawnRate);
}

function ReIndexBlocks() {

    blocks = blocks.filter(function (el) { return el != (null || undefined); });

}

//Calibrate the canvas and reset and start the game
SetCanvas();
Initialize();

//Function that clears and redraws the canvas
function Draw() {

    //Clear the canvas
    context.clearRect(0, 0, playWidth, playHeight);

    //Increment the platfromed frame counter
    platformedframeCounter++;

    numBlocksBelow = 0;//Reset the number of blocks below counter each frame

    //Move the sky's downwards(simulate the game ascending)
    skyY1 += gameSpeed;
    skyY2 += gameSpeed;

    //Once a sky goes below the bottom of the canvas, move it back on top of the canvas
    if (skyY1 >= playHeight) {
        skyY1 = -skyHeight;
    }
    if (skyY2 >= playHeight) {
        skyY2 = -skyHeight;
    }
    //Draw the skys
    context.drawImage(sky, 0, skyY1, skyWidth, skyHeight);
    context.drawImage(sky, 0, skyY2, skyWidth, skyHeight);


    //Update and draw the blocks
    for (var i = 0; i < blocks.length; i++) {

        //If the block is not null
        if (blocks[i] != null) {

            //Update block
            blocks[i].Update();

            //If the block is still not null
            if (blocks[i] != null) {
                blocks[i].Draw();

                //If the block is below the bottom of the canvas
                if (blocks[i].y > playHeight) {

                    //Increment number of blocks below counter
                    numBlocksBelow++;
                }
            }
        }
    }
    //Update and draw the players
    for (var i = 0; i < players.length; i++) {
        players[i].Update();
        players[i].Draw();
    }
    //Update and draw the bullets
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i] != null) {

            //Update the bullet
            bullets[i].Update();

            //If the bullet is still not null
            if (bullets[i] != null) {

                //Draw it
                bullets[i].Draw();
            }
        }
    }

    //If there is 1 player and the show high scores option is enabled
    if (numPlayers == 1 && showHighScores) {

        //Draw all the high scores in the array
        for (var i = 0; i < highscores.length; i++) {
            highscores[i].Draw();
        }
    }

    //If the game is 1 player
    if (players.length == 1) {

        //If player1 died
        if (player1.died) {

            //Stop the music           
            document.getElementById("music").pause();
            document.getElementById("music").currentTime = 0;

            player1.grindSound.pause();
            player1.grindSound.currentTime = 0;

            scoreSound1.pause();

            chargeSound1.pause();
            chargeSound1.currentTime = 0;

            //Stop spawning blocks
            clearTimeout(spawnTimeout);

            //Blur the game
            canvas.style.filter = "blur(3px)";

            //Slow the game to a stop by 0.01%()
            gameSpeed *= 0.99;

            //If the game over form is hidden, show it
            if (submitScoreForm.classList.contains("hidden")) {
                //Show the form
                submitScoreForm.classList.toggle("hidden");

                //Show the name input and submit button
                if (nameInput.classList.contains("hidden")) {
                    nameInput.classList.toggle("hidden");
                    submitScore.classList.toggle("hidden");
                }

                //Set the score shown to the players score
                formScore.innerHTML = parseInt(p1Score);
                hiddenScore.value = parseInt(p1Score);

                submitScoreForm.playAgain.focus();

                //If the new best text is shown, hide it
                if (!formNewBest.classList.contains("hidden")) {
                    formNewBest.classList.toggle("hidden");
                }

                //If this score is a high score
                if (sessionStorage.getItem("highscore") == null || sessionStorage.getItem("highscore") < parseInt(p1Score)) {


                    var newBest = new Audio("sounds/new_best.wav");
                    newBest.volume = soundVolume;
                    newBest.play();

                    //Save the score to session storage
                    sessionStorage.highscore = parseInt(p1Score);

                    //Show the new best test
                    if (formNewBest.classList.contains("hidden")) {
                        formNewBest.classList.toggle("hidden");
                    }
                }

                //Center the form in the window
                submitScoreForm.style.left = window.innerWidth / 2 - submitScoreForm.scrollWidth / 2 + "px";
            }
        }
    }

    //The game is 2 player
    else {

        //If either player died and the game is not over
        if (player1.died || player2.died && !gameover) {

            deadText = "";//Reset the dead text

            //If player 1 held the high score and player 2 died
            if (p1Score > p2Score && player2.died) {
                gameover = true;//Game over
            }

            //If player 2 held the high score and player 1 died
            else if (p2Score > p1Score && player1.died) {
                gameover = true;//Game over
            }

            //The player who held the high score died
            else {
                //If player 1 died
                if (player1.died) {
                    deadText = "Player 1 died!";//Set the dead text

                    player1.grindSound.pause();
                    player1.grindSound.currentTime = 0;
                    scoreSound1.pause();

                    chargeSound1.pause();
                    chargeSound1.currentTime = 0;

                }
                //Player 2 died
                else {
                    deadText = "Player 2 died!";//Set the dead text

                    player2.grindSound.pause();
                    player2.grindSound.currentTime = 0;
                    scoreSound2.pause();

                    chargeSound2.pause();
                    chargeSound2.currentTime = 0;

                }
            }

            //If both players died
            if (player1.died && player2.died) {
                gameover = true;//Game over
            }

            //If the game is over
            if (gameover) {

                chargeSound1.pause();
                chargeSound1.currentTime = 0;

                chargeSound2.pause();
                chargeSound2.currentTime = 0;

                //Stop the music           
                document.getElementById("music").pause();
                document.getElementById("music").currentTime = 0;

                //Stop the grinding sounds
                player1.grindSound.pause();
                player1.grindSound.currentTime = 0;
                scoreSound1.pause();

                //Stop the grinding sounds
                player2.grindSound.pause();
                player2.grindSound.currentTime = 0;
                scoreSound2.pause();

                //Center the game over form
                submitScoreForm.style.left = window.innerWidth / 2 - submitScoreForm.scrollWidth / 2 + "px";

                //Blur the game
                canvas.style.filter = "blur(3px)";

                player1.died = true;
                player2.died = true;

                deadText = "";//Clear the dead text

                clearTimeout(spawnTimeout); //Stop spawning blocks

                //Slow the game to a stop by 0.01%()
                gameSpeed *= 0.99;

                //If the game over form is hidden, show it
                if (submitScoreForm.classList.contains("hidden")) {
                    submitScoreForm.classList.toggle("hidden");
                    submitScoreForm.playAgain.focus();

                    //Play the new best/victory sound
                    var newBest = new Audio("sounds/new_best.wav");
                    newBest.volume = soundVolume;
                    newBest.play();

                    //If player 1 held the high score
                    if (p1Score > p2Score) {
                        formScore.innerHTML = "Player 1 Wins!";//Set the appropriate message
                    }

                    //If player 2 held the high score
                    else if (p2Score > p1Score) {
                        formScore.innerHTML = "Player 2 Wins!";//Set the appropriate message
                    }

                    //Tt was a tie
                    else {
                        formScore.innerHTML = "Tie";//Set the appropriate message
                    }

                }
            }
            context.fillStyle = "#000";
            context.font = "20px bit";
            context.fillText(deadText, (playWidth / 2) - (deadText.length / 2) * 18 / 2, 130);
        }

    }

    //If the game is 2 player
    if (numPlayers == 2) {

        //If player 1 hold the high score
        if (p1Score > p2Score) {

            //Set the score shown to player 1's score
            scoreText = "" + parseInt(p1Score);

            //Set the score shown's color to player 1's color
            context.fillStyle = player1.color;
        }

        //If player 2 hold the high score
        else if (p2Score > p1Score) {

            //Set the score shown to player 2's score
            scoreText = "" + parseInt(p2Score);

            //Set the score shown's color to player 2's color
            context.fillStyle = player2.color;
        }

        //It is a tie
        else {

            //Set the score shown to player 1's score
            scoreText = "" + parseInt(p1Score);

            //Set the score shown's color to grey
            context.fillStyle = "grey";
        }
    }

    //The game is 1 player
    else {

        //Set the score shown to player 1's score
        scoreText = "" + parseInt(p1Score);

        //Set the score shown's color to player 1's color
        context.fillStyle = player1.color;
    }

    //Show the current score of the game
    context.font = scoreSize + "px bit";
    context.fillText(scoreText, (playWidth / 2) - (scoreText.length / 2) * scoreSize / 2, 50 * sizeRatio);
    context.strokeStyle = "#FFF";
    context.strokeText(scoreText, (playWidth / 2) - (scoreText.length / 2) * scoreSize / 2, 50 * sizeRatio);

    //Once the first block lands and the game is not over, allow the ascent of the game
    if (landed && (!player1.died || (players.length > 1 && !player2.died))) {

        //Wait for first block to land before setting the game speed
        if (gameSpeed == 0) {
            gameSpeed = 0.05 * sizeRatio;//Game speed is scaled by size ratio
        }

        //If a player is higher than the mid point of the canvas: increase block spawn rate, block gravity and game speed
        if (player1.y < playHeight / 2 || (players.length > 1 && player2.y < playHeight / 2)) {
            gameSpeed *= 1.005;//Increase by 0.001%
            blockGravity *= 1.0001;//Increase by 0.0001%
            spawnRate *= 0.999;//Decrease(will spawn more often) by 0.0025%

            //Cap the game speed block gravity and spawn rate at their maximum values
            gameSpeed = Math.min(gameSpeed, 0.3 * sizeRatio);//(scaled by size ratio)
            blockGravity = Math.min(blockGravity, 1.3 * sizeRatio);//(scaled by size ratio)
            spawnRate = Math.max(spawnRate, 150);
        }

        //Otherwise slow the block spawn rate, block gravity and game speed back to min
        else {
            gameSpeed *= 0.99;//Decrease by 0.005%
            blockGravity *= 0.999;//Decrease by 0.0001%
            spawnRate *= 1.001;//Increase(will spawn less often) by 0.001%

            //Cap the game speed block gravity and spawn rate at their minimum values
            gameSpeed = Math.max(gameSpeed, 0.05 * sizeRatio);//(scaled by size ratio)
            blockGravity = Math.max(blockGravity, 0.8 * sizeRatio);//(scaled by size ratio)
            spawnRate = Math.min(spawnRate, 300);
        }
    }

    //If the game is 2 player
    if (numPlayers == 2) {

        //If player 1 holds the high score
        if (p1Score > p2Score) {

            //Set the high score bar and color to player 1's high score and color
            highscoreY = (playHeight + gameHeight - player1.height - blocks[0].height - p1Score * sizeRatio);
            context.fillStyle = player1.color;
        }

        //If player 2 holds the high score
        if (p2Score > p1Score) {

            //Set the high score bar and color to player 2's high score and color
            highscoreY = (playHeight + gameHeight - player2.height - blocks[0].height - p2Score * sizeRatio);
            context.fillStyle = player2.color;
        }

        //If it is a tie
        if (p2Score == p1Score) {

            //Set the high score bar and color to player 1's high score and white
            highscoreY = (playHeight + gameHeight - player1.height - blocks[0].height - p1Score * sizeRatio);
            context.fillStyle = "white";
        }
    }
    //The game is 1 player
    else {

        //If player 1's score is greater than the current high score
        if (p1Score > currentHighscore) {

            //Set the high score bar position to player 1's high score
            highscoreY = (playHeight + gameHeight - player1.height - blocks[0].height - p1Score * sizeRatio);
        }

        //The player's score is not greater than the current high score
        else {

            //Set the high score bar position to the current high score
            highscoreY = (playHeight + gameHeight - player1.height - blocks[0].height - currentHighscore * sizeRatio);
        }
        //Set the high score bar color to player 1's color
        context.fillStyle = player1.color;
    }

    //If the number of blocks below the screen is greater than 100 
    // and it has been more than 1000 frames since the last platform spawn
    if (numBlocksBelow > 100 && platformedframeCounter >= 1000) {

        //reses the platform frame counted
        platformedframeCounter = 0;
        //Create and add a platform to the array of blocks
        blocks.push(new Block(0, 0, -1));
    }

    //Draw the high score bar
    context.fillRect(0, highscoreY, playWidth, 2 * sizeRatio);
    context.font = highscoreSize + "px bit";
    context.fillText(highscoreText, (playWidth / 8), highscoreY - 5 * sizeRatio);

    //Move the game down by the game speed(simulate game ascent)
    gameHeight += gameSpeed;

}