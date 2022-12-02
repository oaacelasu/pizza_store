"use strict";

const validateForm = () => {
    const userName = $("#userName").val();
    const password = $("#password").val();
    const confirmPassword = $("#confirmPassword").val();
    const userType = $("#userType").val();


    // validate the entries are not empty and display error message if they are
    if (userName === "" || password === "" || confirmPassword === "" || userType === "") {
        let error = "";

        if (userName === "") {
            error += "❌️ Username is required.\n";
        }

        if (password === "") {
            error += "❌️ Password is required.\n";
        }

        if (confirmPassword === "") {
            error += "❌️ Confirm password is required.\n";
        }

        if (userType === "") {
            error += "❌️ User type is required.\n";
        }
        alert(error);
        return false;
    }

    // validate the password is at least 6 characters long
    if (password.length < 6) {
        alert("❌️ Password must be at least 6 characters long.");
        return false;
    }

    // validate the password and confirm password are the same
    if (password !== confirmPassword) {
        alert("❌️ Passwords do not match.");
        return false;
    }
    return true;
}

window.onload = () => {
    $("#registerForm").submit(validateForm);
}