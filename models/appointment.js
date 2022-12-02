const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    date: {type: Date, required: true},
    time: {type: String, required: true},
    isTimeSlotAvailable:  {type: Boolean, default: true}
});

const model = new mongoose.model('appointment', AppointmentSchema);
module.exports = model
