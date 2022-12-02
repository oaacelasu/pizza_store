exports.validateOrder = (
    req, res, next) => {
    if (req.body.firstName === '' ) {
        console.log('Validation failed')
    } else {
        console.log('Validation success')
        next()
    }
}

exports.isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        req.session.error = "You have to Login first";
        res.redirect("/");
    }
};

exports.isCustomer = (req, res, next) => {
    if (req.session.userType === 'customer') {
        next();
    } else {
        req.session.error = "You don't have permission to access this page";
        res.redirect("/shopping_cart");
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.session.userType === 'admin') {
        next();
    } else {
        req.session.error = "You don't have permission to access this page";
        res.redirect("/dashboard");
    }
}