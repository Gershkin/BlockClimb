<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block Climb</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/png" href="/favicon.png"/>

</head>

<?php

/*Author: Sam Gershkovich 000801766
  Date: November 1, 2020
*/

//connect to database
include 'connect.php';

//validate inputs
$name = filter_input(INPUT_POST, "name", FILTER_SANITIZE_SPECIAL_CHARS);
$score = filter_input(INPUT_POST, "score", FILTER_VALIDATE_INT);

//if validation failed, show error message
if ($name === "" or $name === null or $score === false or $score === null) {
    $ouput = "Bad params, submission failed";
}
//else show success message and submit score to database
else {
    $ouput = "Score Submitted!";
    //prepare and execute the command to insert a new score
    $cmd = "INSERT INTO `highscores`(`name`, `score`) VALUES (?,?)";
    $stmt = $dbh->prepare($cmd);
    $success = $stmt->execute([$name, $score]);
}
?>

<body>
    <form id="submitScoreForm" method="post">
        <h2><?php echo $ouput; ?></h2>
        <input type="submit" formaction="index.php" value="Main Menu">
        <input onclick="GoBack()" type="button" value="Play Again">
    </form>

</body>

<script>
    root = document.documentElement;
    b = document.body;
    form = document.forms[0];
    bWidth = 0;
    bHeight = 0;

    //Once page is loaded set the background and align the form again
    window.addEventListener("load", function() {
        SetBackground();
    });

    //when the window is resized, re-size and align the arcade and menu
    window.addEventListener("resize", function() {
        SetBackground();
    });

    //when the window is rotated(mobile), re-size and align the arcade and menu
    window.addEventListener("rotate", function() {
        SetBackground();
    });

    SetBackground();

    //Go back to the game page
    function GoBack() {
        window.history.go(-1);
    }

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
        form.style.marginTop = bHeight / 7.3994 + "px";
        form.style.width = bWidth / 2.7234 + "px";
        form.style.left = window.innerWidth / 2 - form.scrollWidth / 2 + "px";

        //Update the arcade width property
        root.style.setProperty('--arcade-width', bWidth + "px");
    }
</script>

</html>