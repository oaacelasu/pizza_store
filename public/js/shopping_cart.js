"use strict";

const licenseRegex = /^\d{4}-\d{4}$/;

const validateForm = () => {
    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const licenseNo = $("#license").val();
    const age = $("#age").val();

    const make = $("#make").val();
    const model = $("#model").val();
    const year = $("#year").val();
    const color = $("#color").val();
    const plateNo = $("#plateNo").val();


    // validate the entries are not empty and display error message if they are
    if (firstName === "" || lastName === "" || licenseNo === "" || age === "" || make === "" || model === "" || year === "" || color === "" || plateNo === "") {
        let error = "";
        if (firstName === "") {
            error += "❌️ First name is required.\n";
        }
        if (lastName === "") {
            error += "❌ Last name is required.\n";
        }
        if (licenseNo === "") {
            error += "❌ License number is required.\n";
        }
        if (age === "") {
            error += "❌ Age is required.\n";
        }

        if (make === "") {
            error += "❌ Make is required.\n";
        }
        if (model === "") {
            error += "❌ Model is required.\n";
        }
        if (year === "") {
            error += "❌ Year is required.\n";
        }
        if (color === "") {
            error += "❌ Color is required.\n";
        }
        if (plateNo === "") {
            error += "❌ Plate number is required.\n";
        }
        alert(error);
        return false;
    }

    // validate the license number is in the correct format
    if (!licenseRegex.test(licenseNo)) {
        alert("❌ License number must be in the format ####-####");
        return false;
    }

    // validate the age is a number
    if (Number.isNaN(parseInt(age))) {
        alert("❌ Age must be a number");
        return false;
    }

    return true;
}

window.onload = () => {
    $("#g2Form").submit(validateForm);
}