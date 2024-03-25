const express = require('express')
const router = express.Router()
const { validateUser, UserModel, validateLogin, createToken } = require("../models/userModel");
const bcrypt = require("bcrypt");
const { auth } = require("../middlewares/auth");

router.post("/", async(req, res) => {
    let validBody = validateUser(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details[0].message);
    }
    try {
        let user = new UserModel(req.body);
        // Encrypt the password in the database with Bicrypt module
        // 10 -> encryption level
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();
        // Hide the client-side encryption
        user.password = "******"
        res.json(user);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: "Email already in system", code: 11000 })
        }
        console.log(err);
        res.status(502).json({ err })
    }
})
router.post("/logIn", async(req, res) => {
    let validBody = validateLogin(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details[0].message);
    }
    try {
        // check if there is even a record with the email that was sent
        const user = await UserModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(401).json({ msg: "Email Worng." })
        }
        // check if the record found and the password encrypted in it match
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ msg: "Password Worng." })
        }
        //send token
        const token = createToken(user._id, user.role)
        res.status(200).json({ token, role: user.role })
    } catch (err) {
        console.log(err);
        res.status(502).json(err)
    }
})

module.exports = router