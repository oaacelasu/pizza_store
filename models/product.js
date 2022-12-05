const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    product_type: {
        type: String,
        default: 'main'
    },
    max_toppings: {
        type: Number,
        default: 0
    },
    list_price: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1
    }
});

const model = new mongoose.model('product', ProductSchema);
module.exports = model
