"use strict";

const validateForm = () => {
    const userName = $("#userName").val();
    const password = $("#password").val();



    // validate the entries are not empty and display error message if they are
    if (userName === "" || password === "") {
        let error = "";

        if (userName === "") {
            error += "❌️ Username is required.\n";
        }

        if (password === "") {
            error += "❌️ Password is required.\n";
        }
        alert(error);
        return false;
    }
    return true;
}

window.onload = () => {
    $("#loginForm").submit(validateForm);
}