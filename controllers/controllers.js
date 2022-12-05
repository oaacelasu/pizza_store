/** @member {Object} */
const userModel = require('../models/user');
const orderModel = require('../models/order');
const productModel = require('../models/product');
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
    let products = await productModel.find();
    res.render('shopping_cart', {products: products, userType: req.session.userType})
};

exports.shopping_cart_post = async (req, res) => {
    let data = JSON.parse(req.body.data);

    var t = data.toppings.map(topping => {
        return {
            product_id: topping,
            quantity: 1
        }
    });

    let order = new orderModel({
        user_id: req.session.userId,
        sub_total: data.sub_total,
        tax: data.tax,
        tip: data.tip,
        total: data.total,
        order_items: [
            {
                product_id: data.product,
                quantity: data.quantity,
                toppings: t
            },
            ...data.sides
        ]
    });

    await order.save();
    res.redirect('/my_orders');
}

exports.my_orders = async (req, res) => {
    orderModel.aggregate([
        [
            {
                '$unwind': {
                    'path': '$order_items'
                }
            }, {
            '$lookup': {
                'from': 'products',
                'localField': 'order_items.product_id',
                'foreignField': '_id',
                'as': 'order_items.product'
            }
        }, {
            '$unwind': {
                'path': '$order_items.product'
            }
        }, {
            '$group': {
                '_id': '$_id',
                'order_items': {
                    '$push': '$order_items'
                }
            }
        }, {
            '$lookup': {
                'from': 'orders',
                'localField': '_id',
                'foreignField': '_id',
                'as': 'orderDetails'
            }
        }, {
            '$unwind': {
                'path': '$orderDetails'
            }
        }, {
            '$addFields': {
                'orderDetails.order_items': '$order_items'
            }
        }, {
            '$replaceRoot': {
                'newRoot': '$orderDetails'
            }
        },
            {
                '$sort': {
                    'createdDate': -1
                }
            }, {
            '$project': {
                'tip': 0,
                'sub_total': 0,
                'tax': 0,
                '__v': 0,
                'createdDate': 0
            }
        }
        ]
    ]).exec((err, orders) => {
        if (err) throw err;
        console.log(orders);
        res.render('my_orders', {orders: orders, userType: req.session.userType})
    });
}

// Admin Routes
exports.dashboard = async (req, res) => {
    // TODO - get all the orders and render the dashboard
    res.render('dashboard', {userType: req.session.userType})
}

exports.dashboard_order_update = async (req, res) => {
    // TODO: update the order status - - should use the order id to update the order status
}