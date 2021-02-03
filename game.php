<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Block Climb</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="favicon.png"/>

</head>

<?php

/*Author: Sam Gershkovich 000801766
  Date: November 1, 2020
*/

//connect to database
include 'connect.php';

//If the parameters  exist
if (isset($_POST["numPlayers"])) {
    $numPlayers = filter_input(INPUT_POST, "numPlayers", FILTER_VALIDATE_INT);
    $p1Color = filter_input(INPUT_POST, "p1Color", FILTER_SANITIZE_SPECIAL_CHARS);
    $p2Color = filter_input(INPUT_POST, "p2Color", FILTER_SANITIZE_SPECIAL_CHARS);
    $playerCollision = filter_input(INPUT_POST, "playerCollision", FILTER_VALIDATE_BOOLEAN);
    $friendlyFire = filter_input(INPUT_POST, "friendlyFire", FILTER_VALIDATE_BOOLEAN);
    $musicVolume = filter_input(INPUT_POST, "musicVolume", FILTER_VALIDATE_FLOAT);
    $soundVolume = filter_input(INPUT_POST, "effectsVolume", FILTER_VALIDATE_FLOAT);
    $blockOutlines = filter_input(INPUT_POST, "blockOutlines", FILTER_VALIDATE_BOOLEAN);
    $showHighScores = filter_input(INPUT_POST, "showHighScores", FILTER_VALIDATE_BOOLEAN);
}

//The parameters dont exist; set defaults
else {
    $numPlayers = 1;
    $p1Color = "red";
    $p2Color = "blue";
    $playerCollision = true;
    $friendlyFire = true;
    $musicVolume = 1;
    $soundVolume = 1;
    $blockOutlines = false;
    $showHighScores = false;
}

//Create hidden inputs to store the settings from the main menu
echo '<input type="hidden" id="numPlayers" value="' . $numPlayers . '">';
echo '<input type="hidden" id="p1Color" value="' . $p1Color . '">';
echo '<input type="hidden" id="p2Color" value="' . $p2Color . '">';
echo '<input type="hidden" id="playerCollision" value="' . $playerCollision . '">';
echo '<input type="hidden" id="friendlyFire" value="' . $friendlyFire . '">';
echo '<input type="hidden" id="musicVolume" value="' . $musicVolume . '">';
echo '<input type="hidden" id="soundVolume" value="' . $soundVolume . '">';
echo '<input type="hidden" id="blockOutlines" value="' . $blockOutlines . '">';
echo '<input type="hidden" id="showHighScores" value="' . $showHighScores . '">';

//prepare and execute the command to get the top 10 players
$cmd = "SELECT * FROM `highscores` ORDER BY `score` DESC LIMIT 10";
$stmt = $dbh->prepare($cmd);
$success = $stmt->execute([]);

$count = 1;

$scores = array();

//loop through the players we fetched and add each one to the scores array
while ($row = $stmt->fetch()) {
    array_push($scores, $row);
    $count++;
}
?>

<body>

    <img id="sky" width="800" height="800" src="images/sky.jpg" alt="sky">
    <img id="glasses_left" width="400" height="400" src="images/glasses_left.png" alt="glasses_left">
    <img id="glasses_right" width="25" height="25" src="images/glasses_right.png" alt="glasses_right">
    <img id="glasses_up" width="25" height="25" src="images/glasses_up.png" alt="glasses_up">
    <img id="skull" width="25" height="25" src="images/skull.png" alt="skull">
    <img id="block_big" width="25" height="25" src="images/block_big.jpg" alt="block_big">
    <img id="block_flat" width="25" height="25" src="images/block_flat.jpg" alt="block_flat">
    <img id="block_tall" width="25" height="25" src="images/block_tall.jpg" alt="block_tall">
    <img id="floor" width="25" height="25" src="images/floor.jpg" alt="floor">

    <canvas id="canvas"></canvas>

    <form id="submitScoreForm" method="post">
        <h2 id="score">100</h2>
        <h3 id="best" class="hidden">New Best!</h3>
        <input type="hidden" name="score" id="hiddenScore" value="">
        <input type="text" name="name" id="nameInput" class="hidden" placeholder="Enter your name" maxlength="20" required>
        <input type="submit" name="submitScore" id="submit" class="hidden" formaction="upload.php" value="Submit">
        <input type="button" name="playAgain" onclick="Initialize()" value="Play Again">
        <input type="submit" name="mainMenuButton" formaction="index.php" value="Main Menu">
    </form>

    <form id="pauseMenu" class="hidden" method="post">
        <h2 id="pauseText">PAUSED</h2>
        <input type="submit" name="mainMenuButton" formaction="index.php" value="Main Menu">
        
    </form>

    <!-- Sound effects and music to be used in game -->
    <audio id="jumpSound" src="sounds/jumpP.wav"></audio>
    <audio id="music" src="sounds/block_climb_main.mp3" loop></audio>
    <audio id="scoreSound1" src="sounds/score.mp3" loop></audio>
    <audio id="scoreSound2" src="sounds/score.mp3" loop></audio>
    <audio id="chargeSound1" src="sounds/charge.wav" ></audio>
    <audio id="chargeSound2" src="sounds/charge.wav" ></audio>

    <div id="mobile-controls">
        <button id="left">Left</button>
        <button id="right">Right</button>
        <button id="jump">Jump</button>
        <button id="shoot">Shoot</button>
    </div>

</body>

<script>
    //When the user clicks the main menu button, disable the name field requirment to allow the submission back to index.php
    document.forms[0].mainMenuButton.addEventListener("click", function() {
        document.forms[0].name.required = false;
    });

    //When the user submits their score, override the score to submit with the player's score from the game (no cheating)
    document.forms[0].addEventListener("submit", function(event) {
        document.forms[0].score.value = parseInt(p1Score);
    });

    //When the user submits their score, override the score to submit with the player's score from the game (no cheating)
    document.addEventListener("keyup", function(event) {
        if (event.key == " ") {
            event.preventDefault();;
        }
    });

    //Encode the top 10 scores array so it can be used to create
    //a list of high score objects that are displayed in game
    var highScores = <?php echo json_encode($scores); ?>;
</script>

<script src="js/block_climb.js"></script>

</html>