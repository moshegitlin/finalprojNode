const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const {config}= require("../middlewares/secret")

const userSchema = new mongoose.Schema({
    name: String,
    email:{type:String, unique:true},
    password: String,
    date_created: {
        type: Date,
        default: Date.now()
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "superAdmin"]
    }
})
exports.UserModel = mongoose.model('users', userSchema);

exports.validateUser = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        email: Joi.string().min(2).max(300).required().email(),
        password: Joi.string().min(2).max(20).required()
    })
    return schema.validate(user);
}
// validate login
exports.validateLogin = (user) => {
    const schema = Joi.object({
        email: Joi.string().min(2).max(300).required().email(),
        password: Joi.string().min(2).max(20).required()
    })
    return schema.validate(user);
}
exports.createToken = (_id, role) => {
    return jwt.sign({_id,role},config.tokenSecret, {expiresIn: '20d'})
}

