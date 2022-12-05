const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'user'},
    order_status: {type: String, default: 'pending'},
    sub_total: {type: Number, default: 0},
    tax: {type: Number, default: 0},
    tip: {type: Number, default: 0},
    total: {type: Number, default: 0},
    order_items: [{
        product_id: {type: Schema.Types.ObjectId, ref: 'product'},
        quantity: {type: Number, default: 0},
        toppings: [{
            product_id: {type: Schema.Types.ObjectId, ref: 'product'},
            quantity: {type: Number, default: 0},
        }]
    }],
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
});

const model = new mongoose.model('order', OrderSchema);
module.exports = model
