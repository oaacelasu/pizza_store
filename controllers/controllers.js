/** @member {Object} */
const userModel = require('../models/user');
const orderModel = require('../models/order');
const productModel = require('../models/product');
const bcrypt = require('bcryptjs');
const FPDF = require('node-fpdf')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

class PDF extends FPDF {
    Header() {
        //this.Image(`${__dirname}/logo.png`, 50, 10, 30, 30);
        this.SetMargins(5, 5, 5)
        this.Ln(2);
        this.printCenteredLine('El Mantel', "B", 20);
        this.Ln(3);
        this.printCenteredLine('1234 Pizza Street');
        this.printCenteredLine('Waterloo, ON N2L 3G4');
        this.printCenteredLine('Tel: 604-123-4567');
        this.printCenteredLine('Email:elmantel_resto@eataly.com');
        this.printCenteredLine('Website: www.elmantelpizzeria.com');
        this.Ln(10);
        this.printCenteredLine('*** RECEIPT ***', "B", 20);
        this.Ln(10);
    }

    UserInfo(user) {
        this.SetFont('Times', 'B', 10) //Letra Arial, negrita (Bold), tam. 20
        this.Cell(50, 3, 'USER INFO', 0, 1, 'L')
        this.Ln()
        this.SetFont('Times', '', 8) //Letra Arial, negrita (Bold), tam. 20
        this.Cell(50, 5, "Name", 0, 0, 'L')
        this.Cell(50, 5,  `${user.firstName} ${user.lastName}` , 0, 1, 'R')

        this.Cell(50, 5, "Email", 0, 0, 'L')
        this.Cell(50, 5,  `${user.email}` , 0, 1, 'R')

        this.Cell(50, 5, "Phone", 0, 0, 'L')
        this.Cell(50, 5,  `${user.phone}` , 0, 1, 'R')

        this.Cell(50, 5, "Address", 0, 0, 'L')
        this.Cell(50, 5,  `${user.address}` , 0, 1, 'R')
        this.Ln(5)
    }

    OrderInfo(order) {
        this.SetFont('Times', 'B', 8) //Letra Arial, negrita (Bold), tam. 20
        this.Cell(50, 5, 'Order: ' + order._id, 0, 0, 'L')
        this.Cell(50, 5, order.createdDate.toLocaleString(), 0, 1, 'R')
        this.Ln(1)
        this.Cell(99, 0, '', 1, 1, 'C')
        this.Ln()
        this.SetFont('Times', 'B', 10) //Letra Arial, negrita (Bold), tam. 20
        this.Cell(15, 5, 'ITEM')
        this.Cell(15, 5, 'QTY')
        this.Cell(50, 5, 'DESC')
        this.Cell(20, 5, 'COST')
        this.Ln()
        this.Cell(99, 0, '', 1, 1, 'C')
        this.Ln()
        this.SetFont('Times', '', 8) //Letra Arial, negrita (Bold), tam. 20
        if(order.order_items.length > 0){
            order.order_items.forEach((item, index) => {
                let payedToppings = item.toppings.length - item.product.max_toppings;

                this.Cell(15, 5, "abcd")
                this.Cell(15, 5, item.quantity)
                this.Cell(50, 5, item.product.name)
                this.Cell(20, 5, `$${item.product.list_price * item.quantity + payedToppings * 2}`)
                this.Ln()
                if (item.toppings.length - item.product.max_toppings > 0) {
                    this.Cell(100, 5, `${payedToppings}x Additional Toppings`, 0, 1, 'C')
                    this.Ln()
                }
            });
        }
    }

    OrderTotal(order) {
        this.Cell(99, 0, '', 1, 1, 'C')
        this.Ln(3)
        this.Cell(50, 3, 'SUBTOTAL', 0, 0, 'L')
        this.Cell(50, 3, `$${order.sub_total}`, 0, 1, 'R')
        this.Ln()
        this.Cell(50, 3, 'TAX', 0, 0, 'L')
        this.Cell(50, 3, `$${order.tax}`, 0, 1, 'R')
        this.Ln()
        this.Cell(50, 3, 'TIP', 0, 0, 'L')
        this.Cell(50, 3, `$${order.tip}`, 0, 1, 'R')
        this.Ln()
        this.Cell(99, 0, '', 1, 1, 'C')
        this.SetFont('Times', 'B', 10) //Letra Arial, negrita (Bold), tam. 20
        this.Ln(1)
        this.Cell(50, 3, 'TOTAL', 0, 0, 'L')
        this.Cell(50, 3, `$${order.total}`, 0, 1, 'R')
        this.Ln(10)
    }

    printCenteredLine = (text, w, size) => {
        this.SetFont('Arial', w??"", size ?? 10);
        this.Cell(100, 5, text, 0, 1, 'C');
    }
}

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

exports.my_orders_receipt = async (req, res) => {
    orderModel.aggregate([
        [{
            '$match': {
                '_id': new ObjectId(req.params.id)
            }
        },

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
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }
        ]
    ]).exec((err, order) => {
        if (err) throw err;
        let cPdfName = `${__dirname}/order_detail.pdf`
        const pdf = new PDF('P', 'mm', [110, 297]);
        pdf.AddPage()
        // user info
        pdf.UserInfo(order[0].user[0])
        pdf.OrderInfo(order[0])
        pdf.OrderTotal(order[0])

        // Thanks for shopping
        pdf.SetFont('Times', 'B', 10) //Letra Arial, negrita (Bold), tam. 20
        pdf.Cell(100, 3, 'THANKS FOR SHOPPING!', 0, 1, 'C')
        pdf.Ln(5)

        pdf.Output('f', cPdfName)
        res.download(cPdfName)
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