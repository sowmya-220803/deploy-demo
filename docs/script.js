$(document).ready(function () {

    // Alert button
    $("#alertBtn").click(function () {
        alert("Hello! This site is deployed successfully 🚀");
    });

    // Change text dynamically
    $("#changeTextBtn").click(function () {
        $(".lead").text("Text changed using jQuery!");
    });

    // Footer update
    $("#footerText").click(function () {
        $(this).text("You clicked the footer!");
    });

});