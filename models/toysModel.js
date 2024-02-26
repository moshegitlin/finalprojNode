const mongoose = require('mongoose');
const joi = require('joi');

const toySchema = new mongoose.Schema({
    name: {
        type: String
    },
    info: {
        type: String
    },
    category: {
        type: String
    },
    img_url: {
        type: String,
    },
    price: {
        type: Number
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }

})
exports.ToySchema= mongoose.model('toys', toySchema);
module.exports.validateToy = (toy) => {
    const schema = joi.object({
        name: joi.string().min(3).max(50).required(),
        info: joi.string().required().min(3).max(1000),
        category: joi.string().required().min(3).max(50),
        img_url: joi.string().optional().min(3),
        price: joi.number().required().min(1).max(1000000)
    });
    return schema.validate(toy);
}


