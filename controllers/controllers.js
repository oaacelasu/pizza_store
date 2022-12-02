/** @member {Object} */
const userModel = require('../models/user');
const bcrypt = require('bcryptjs');


// common routes
exports.login = (req, res) => {
    const msg = req.query.msg;
    req.session.isAuth = false
    res.render('login', {msg: msg ?? 'Welcome! Please Enter Login Details'})
}

exports.login_post = async (req, res) => {
    const {userName, password} = req.body

    let user = await userModel.findOne({userName})

    if (!user) {
        return res.redirect('/register')
    }

    if (user) {
        const pwdMatch = await bcrypt.compare(password, user.password)
        if (pwdMatch) {
            req.session.isAuth = true
            req.session.userId = user._id
            req.session.userType = user.userType

            if (user.userType === 'customer') {
                res.redirect('/shopping_cart')
            } else {
                res.redirect('/dashboard')
            }
        } else {
            let msg = 'Invalid Credentials'
            res.redirect(`/?msg=${msg}`);
        }
    }
}

exports.register = (req, res) => {
    req.session.isAuth = false
    res.render('register')
}

exports.register_post = async (req, res) => {
    let msg = ''
    const {userName, userType, password} = req.body

    let user = await userModel.findOne({userName})

    if (user) {
        msg = 'You are already Registered Please Enter Login Details!'
    } else {
        msg = 'Registration Successful! Please Enter Login Details!'
        const hashedPwd = await bcrypt.hash(password, 12)

        user = new userModel({
            userName,
            userType,
            password: hashedPwd
        })

        console.log(user)
        console.log("User Creation Started");
        await user.save()
        console.log("User Created Successfully as:" + user);
    }
    res.redirect(`/?msg=${msg}`);
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/')
    });
}

// Customer Routes
exports.shopping_cart = async (req, res) => {
    // TODO - get the menu and render the shopping form page
    res.render('shopping_cart', {userType: req.session.userType})
};

exports.shopping_cart_post = async (req, res) => {

    // TODO - place the order and redirect to the my orders page
    let e = req.body;
}

// Admin Routes
exports.dashboard = async (req, res) => {
    // TODO - get all the orders and render the dashboard
    res.render('dashboard', {userType: req.session.userType})
}

exports.dashboard_order_update = async (req, res) => {
    // TODO: update the order status - - should use the order id to update the order status
}