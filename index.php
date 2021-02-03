<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block Climb</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="favicon.png" />
</head>
<?php

//connect to database
include 'connect.php';

//prepare and execute the command to get the top 10 players
$cmd = "SELECT * FROM `highscores` ORDER BY `score` DESC LIMIT 10";
$stmt = $dbh->prepare($cmd);
$success = $stmt->execute([]);

$top10 = "";

//create the top 10 players table
$top10 .= '<table> 
    <thead>
        <th>Position</th> <th>Name</th>  <th>Score</th> 
    </thead>';

$count = 1;

//loop through the players we fetched and create a row for each one
while ($row = $stmt->fetch()) {
    $top10 .= '<tr>
            <td>' . $count . '</td> <td>' . $row['name'] . '</td> <td>' . $row['score'] . '</td>
        </tr>';
    $count++;
}
$top10 .= '</table>';
?>

<body>
    <span id="formContainer">
        <br>
        <form id="mainMenu" action="game.php" method="post">

            <div id="main">
                <input type="submit" name="submit" value="Play">
                <input id="leaderboardButton" onclick="ShowLeaderBoard()" type="button" value="Leaderboard">
                <input id="howToButton" onclick="ShowHowTo()" type="button" value="How to play">
                <input id="settingsButton" onclick="ShowSettings()" type="button" value="Settings">
                <input id="credtsButton" onclick="ShowCredits()" type="button" value="Credits">

            </div>

            <div id="leaderboard" class="hidden">
                <?php echo $top10; ?>
                <input id="leaderboardBack" onclick="ShowLeaderBoard()" type="button" value="Back">
            </div>

            <div id="howTo" class="hidden">
                <p>Climb as high as possible without getting squashed or falling below the edge of the game.</p>
                <p><b>Player 1 Controls:</b></p>
                <p>Move: A, D<br>Jump: W<br>Shoot: Space</p>

                <p><b>Player 2 Controls:</b></p>
                <p>Move: Left, Right<br>Jump: Up<br>Shoot: 0</p>

                <input id="howToBack" onclick="ShowHowTo()" type="button" value="Back">
            </div>

            <div id="credits" class="hidden">
                <p><b>Coding and design:</b></p>
                <p>Sam Gershkovich</p>
                <br>
                <p><b>Music and sound:</b></p>
                <p>Harrison Green</p>
                <br>
                <input id="creditsBack" onclick="ShowCredits()" type="button" value="Back">
            </div>

            <div id="settings" class="hidden">
                <label>
                    <span>1 Player</span> <input id="1player" onclick="PlayerSettings1()" name="numPlayers" type="radio" value="1" checked>
                </label>
                <label>
                    <span>2 Player</span> <input id="2player" onclick="PlayerSettings2()" name="numPlayers" type="radio" value="2">
                </label>

                <label id="p1Color">Color<input type="color" name="p1Color" value="#FF0000">
                    <input id="p1Random" onclick="P1RandomColor()" name="p1Random" type="button" value="Random">
                </label>

                <label id="p2Color">Color<input type="color" name="p2Color" value="#0062FF">
                    <input id="p2Random" onclick="P2RandomColor()" name="p2Random" type="button" value="Random">
                </label>

                <div id="collisionSettings">
                    <label> Player Collision <input name="playerCollision" type="checkbox" checked> </label>
                    <label> Friendly Fire <input name="friendlyFire" type="checkbox" checked> </label>
                </div>

                <label id="blockOutlines"><span>Block Outlines:</span> <input type="checkbox" name="blockOutlines"></label>
                <label id="showHighScores"><span>Show High Scores:</span> <input type="checkbox" name="showHighScores"></label>

                <input id="soundButton" onclick="ShowSoundSettings()" type="button" value="Sound Settings">

                <input id="settingsBack" onclick="ShowSettings()" type="button" value="Back">
            </div>
            <div id="sound" class="hidden">
                <label> Music Volume: <input type="range" id='musicVolume' name="musicVolume" min="0" max="1" step="0.01" value="1">
                </label><br><br>
                <label> Sound Volume: <input type="range" name="effectsVolume" min="0" max="1" step="0.01" value="1">
                </label>
                <input id="settingsButton" onclick="ShowSoundSettings()" type="button" value="Back">
            </div>

        </form>
    </span>
    <audio id="menuMusic" src="sounds/block_climb_menu.mp3" autoplay loop> </audio>

    <script>
        window.addEventListener("load", function() {


            formContainer = document.getElementById("formContainer");
            form = document.forms[0];

            leaderboardButton = document.getElementById("leaderboardButton");
            settingsButton = document.getElementById("settingsButton");
            soundButton = document.getElementById("soundButton");

            mainDiv = document.getElementById("main");
            leaderboardDiv = document.getElementById("leaderboard");
            howToDiv = document.getElementById("howTo");
            creditsDiv = document.getElementById("credits");
            settingsDiv = document.getElementById("settings");
            soundDiv = document.getElementById("sound");

            random1 = form.p1Random;
            random2 = form.p2Random;

            color1 = form.p1Color;
            color2 = form.p2Color;

            collisionSettings = document.getElementById("collisionSettings");

            root = document.documentElement;

            b = document.body;
            bWidth = 0;
            bHeight = 0;

            music = document.getElementById("menuMusic");
            


            //If the player clicks any where on the document
            document.addEventListener("click", function() {

                //If the music isn't playing
                if (music.paused) {

                    //Play it
                    music.play();
                }
            });


            //If the user presses any key
            document.addEventListener("keydown", function() {

                //If the music isn't playing
                if (music.paused) {

                    //Play it
                    music.play();
                }
            });

            PlayerSettings1();
            SetBackground();

            //If there are settings saved in the session storage
            if (sessionStorage.getItem("p1Color") != null) {

                //Load the settings from session storage if available

                //Set the number of players
                if (sessionStorage.numPlayers == 1) {
                    document.getElementById("1player").checked = true;
                } else if (sessionStorage.numPlayers == 2) {
                    document.getElementById("2player").checked = true;
                    collisionSettings.classList.toggle("hidden");
                    p2Color.classList.toggle("hidden");
                    random2.classList.toggle("hidden");
                }

                //Set the player colors
                if (sessionStorage.p1Color != null) {
                    form.p1Color.value = sessionStorage.p1Color;
                }
                if (sessionStorage.p2Color != null) {
                    form.p2Color.value = sessionStorage.p2Color;
                }

                //Set the player collision
                if (sessionStorage.playerCollision == 1) {
                    form.playerCollision.checked = true;
                }

                //Set friendly fire
                if (sessionStorage.friendlyFire == 1) {
                    form.friendlyFire.checked = true;
                }

                //Set the volume settings
                form.musicVolume.value = sessionStorage.musicVolume;
                form.effectsVolume.value = sessionStorage.soundVolume;

                //Set block outlines
                if (sessionStorage.blockOutlines == 1) {
                    form.blockOutlines.checked = true;
                }
                //Set show high scores
                if (sessionStorage.showHighScores == 1) {
                    form.showHighScores.checked = true;
                }
            }

            musicVolume = document.getElementById("musicVolume").value;
            music.volume = musicVolume;

            //when the window is resized, re-size and align the arcade and menu
            window.addEventListener("resize", function() {
                SetBackground();
            });

            //when the window is rotated(mobile), re-size and align the arcade and menu
            window.addEventListener("rotate", function() {
                SetBackground();
            });

        });
        //Set the proper size of the arcade background
        function SetBackground() {

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

            //Set the main menu to be in the center of the arcade
            form.style.width = bWidth / 2.7234 + "px";
            form.style.height = "inherit";
            form.style.left = window.innerWidth / 2 - form.scrollWidth / 2 + "px";

            //Update the arcade width property
            root.style.setProperty('--arcade-width', bWidth + "px");

            //Set the canvas to always be located in place of the arcade machine screen
            formContainer.style.marginTop = bHeight / 9.75041 + "px";

            //Set the size of the canvas to the size of the arcade machine screen
            formContainer.style.width = bWidth / 2.0723 + "px"; //(arcade machine width / left edge of arcade machine screen = 2.0723)
            formContainer.style.height = bHeight / 1.6306 + "px"; //(arcade machine height / top edge of arcade machine screen =  1.6026)
        }

        //Show leader board div
        function ShowLeaderBoard() {
            mainDiv.classList.toggle("hidden");
            leaderboardDiv.classList.toggle("hidden");
        }

        //Show how to play div
        function ShowHowTo() {
            mainDiv.classList.toggle("hidden");
            howToDiv.classList.toggle("hidden");
        }

        //Show credits div
        function ShowCredits() {
            mainDiv.classList.toggle("hidden");
            creditsDiv.classList.toggle("hidden");
        }

        //Show the settings div
        function ShowSettings() {
            mainDiv.classList.toggle("hidden");
            settingsDiv.classList.toggle("hidden");
        }
        //Show the settings div
        function ShowSoundSettings() {
            soundDiv.classList.toggle("hidden");
            settingsDiv.classList.toggle("hidden");
        }
        //Hide the 2 player settings
        function PlayerSettings1() {
            if (!collisionSettings.classList.contains("hidden")) {
                collisionSettings.classList.toggle("hidden");
                p2Color.classList.toggle("hidden");
                random2.classList.toggle("hidden");
            }
        }

        //Show the 2 player settings
        function PlayerSettings2() {
            if (collisionSettings.classList.contains("hidden")) {
                collisionSettings.classList.toggle("hidden");
                p2Color.classList.toggle("hidden");
                random2.classList.toggle("hidden");
            }
        }

        //Generate a random hex color(6 random characters from 0-F)
        function P1RandomColor() {
            color1.value = "#" + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16);
        }

        //Generate a random hex color(6 random characters from 0-F)
        function P2RandomColor() {
            color2.value = "#" + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16) + Math.floor(Math.random() * 15).toString(16);
        }
    </script>


</body>

</html>