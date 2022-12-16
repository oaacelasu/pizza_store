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
    // const order_type = req.body
    // if(order_type.length === undefined || order_type === ''){
    //     order_type = ""
    // }
    const order_type = ""
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
            '$match':{
                '$expr':{
                    '$cond':[
                        {'$in' :[order_type,[null, "", "undefined"]]},
                        true,
                        {'$eq':['$order_status',order_type]}
                    ]
                }
            }
        },{
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
    let products = await productModel.find();
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
                    '__v': 0,
                    'createdDate': 0
                }
            }
        ]
    ]).exec((err, orders) => {
        if (err) throw err;
        console.log(orders);

        var total_completed = 0;
        var total_pending = 0;
        var total_orders = 0;
        for(const row of orders)
        {
            if(row.order_status === "pending"){
                total_pending = total_pending + row.total;
            } else if(row.order_status === "completed"){
                total_completed = total_completed + row.total;
            }
        }
        total_orders = total_completed + total_pending;

        res.render('dashboard', {userType: req.session.userType,total_orders:total_orders.toFixed(2), 
            total_completed:total_completed.toFixed(2), total_pending:total_pending.toFixed(2),
        products:products})
    });

    
}

exports.dashboard_order_update = async (req, res) => {
    // TODO: update the order status - - should use the order id to update the order status
}


class WEEKLYPDF extends FPDF {
    Header() {
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
        this.printCenteredLine('*** Sales Report ***', "B", 20);
        this.Ln(10);
    }
    
    printCenteredLine = (text, w, size) => {
        this.SetFont('Arial', w??"", size ?? 10);
        this.Cell(100, 5, text, 0, 1, 'C');
    }

    printSideHeading = (text, w, size) => {
        this.SetFont('Arial', w??"", size ?? 10);
        this.Cell(50, 3, text, 0, 1, 'L');
        this.Ln(2);
    }

    weeklyReport(header, orders, productList)
    {
        this.printSideHeading('Product Sales by Order',"B", 20);
        
        const price_map = new Map();

        for(const product of productList){
            price_map.set(product.name, product.list_price);
        }
        // Header
        for(const col of header){
            this.SetFont('Times', 'B', 8)
            this.Cell(30,6,col,0);
        }
        this.Ln();
        this.Cell(99, 0, '', 1, 1, 'C')
        // Data
        var i = 1;
        var week_total = 0;
        var tax_total = 0;
        var tip_total = 0;

        const main_products = new Map();
        const side_products = new Map();
        const topping_products = new Map();
        
        for(const row of orders)
        {   
            this.SetFont('Times', '', 8)
            this.Cell(30,4,i,0);
            this.Cell(30,4,row.sub_total,0);
            this.Cell(30,4,row.tax,0);
            this.Cell(30,4,row.total,0);
            this.Ln();
            week_total = week_total + row.total;
            tax_total = tax_total + row.tax;
            tip_total = tip_total + row.tip;
            i+=1;


            if(row.order_items.length > 0){
                for(const item of row.order_items){
                    if(item.product.product_type === "main"){
                        if(main_products.has(item.product.name)){
                            main_products.set(item.product.name, main_products.get(item.product.name)+1);
                        } else{
                            main_products.set(item.product.name, 1);
                        }
                    } else if(item.product.product_type === "side"){
                        if(side_products.has(item.product.name)){
                            side_products.set(item.product.name, side_products.get(item.product.name)+1);
                        } else {
                            side_products.set(item.product.name, 1);
                        }
                    } 
                }
            }
        }
        this.Cell(99, 0, '', 1, 1, 'C')
        this.Ln();
        this.Cell(30,6,'',0);
        this.Cell(30,6,'',0);
        this.Cell(30,6,'Total Product Sales',0);
        this.Cell(30,6,week_total.toFixed(2),0);
        this.Ln(10);

        this.printSideHeading('Product Sales by Category',"B", 20);

        const productHeader = ['Product', 'Rate', 'Items Sold', 'Total'];
        var product_total = 0;
        for(const col of productHeader){
            this.SetFont('Times', 'B', 8)
            this.Cell(30,6,col,0);
        }
        this.Ln();
        this.Cell(99, 0, '', 1, 1, 'C')

        for(let main of main_products.keys()){
            this.SetFont('Times', '', 8)
            this.Cell(30,4,main,0);
            this.Cell(30,4,price_map.get(main),0);
            this.Cell(30,4,main_products.get(main),0);
            this.Cell(30,4,main_products.get(main) * price_map.get(main),0);
            this.Ln();
            product_total = product_total + main_products.get(main) * price_map.get(main);
        }
        for(let side of side_products.keys()){
            this.SetFont('Times', '', 8)
            this.Cell(30,4,side,0);
            this.Cell(30,4,price_map.get(side),0);
            this.Cell(30,4,side_products.get(side),0);
            this.Cell(30,4,side_products.get(side) * price_map.get(side),0);
            this.Ln();
            product_total = product_total + side_products.get(side) * price_map.get(side);
        }

        this.Ln();
        this.Cell(99, 0, '', 1, 1, 'C')
        this.Cell(30,6,'',0);
        this.Cell(30,6,'',0);
        this.Cell(30,6,'Total Product Sales',0);
        this.Cell(30,6,product_total,0);

        this.Ln();
        this.Cell(30,6,'',0);
        this.Cell(30,6,'',0);
        this.Cell(30,6,'Total Tax',0);
        this.Cell(30,6,tax_total,0);

        this.Ln();
        this.Cell(30,6,'',0);
        this.Cell(30,6,'',0);
        this.Cell(30,6,'Total Tips',0);
        this.Cell(30,6,tip_total,0);

        this.Ln();
        this.Cell(99, 0, '', 1, 1, 'C')
        this.Cell(30,6,'',0);
        this.Cell(30,6,'',0);
        this.Cell(30,6,'Net Sales',0);
        this.Cell(30,6,tip_total + tax_total + product_total,0);
        this.Ln();
    }
}



exports.weekly_report = async (req, res) => {
    let productList = await productModel.find();
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
                    '__v': 0,
                    'createdDate': 0
                }
            }
        ]
    ]).exec((err, orders) => {
        if (err) throw err;
        console.log(orders);
        // console.log("Will print weekly report here");

        let cPdfName = `${__dirname}/weekly_report.pdf`
        const pdf = new WEEKLYPDF('P', 'mm', [110, 297]);
        pdf.AddPage()
        // user info
        // pdf.UserInfo(order[0].user[0])
        // pdf.OrderInfo(order[0])
        // pdf.OrderTotal(order[0])
         // Thanks for shopping
         pdf.Ln(5)
        
         const header = ['Order','SubTotal','Tax','Total'];
         pdf.weeklyReport(header,orders, productList);
         
         pdf.Output('f', cPdfName)
         res.download(cPdfName)
    });
}