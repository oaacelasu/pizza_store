const {mongoose} = require('mongoose');
const mongo_string_connection = require('../config/default').mongo_string_connection;

const init = async () => {
    try {
        await mongoose.connect(mongo_string_connection, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
    } catch (error) {
        console.log(error);
        console.log("Connection Failed!");
    }
}
module.exports = init;