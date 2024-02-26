const express = require('express')
const router = express.Router()
const {validateUser, UserModel, validateLogin,createToken} = require("../models/userModel");
const bcrypt = require("bcrypt");
const {auth} = require("../middlewares/auth");

// http://localhost:3001/users
// ראוט זה רושם משתמש חדש
router.post("/", async(req,res) => {
  let validBody = validateUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details[0].message);
  }
  try{
    let user = new UserModel(req.body);
    // להצפין את הסיסמא במסד עם מודול ביקריפט
    // 10 -> רמת הצפנה
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    // להסתיר את ההצפנה לצד לקוח
    user.password = "******"
    res.json(user);
  }
  catch(err){
    if(err.code === 11000){
      return res.status(400).json({msg:"Email already in system",code:11000})
    }
    console.log(err);
    res.status(502).json({err})
  }
})
// http://localhost:3001/users/logIn
router.post("/logIn", async(req,res) => {
  let validBody = validateLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details[0].message);
  }
  try{
    // לבדוק אם בכלל יש רשומה עם המייל שנשלח
    const user = await UserModel.findOne({email:req.body.email})
    if(!user){
      return res.status(401).json({msg:"Email Worng."})
    }
    // לבדוק אם הרשומה שנמצאה הסיסמא המוצפנות בתוכה מתאימה
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
      return res.status(401).json({msg:"Password Worng."})
    }
    // לשלוח טוקן
    const token = createToken(user._id, user.role)
    res.status(200).json({token,role:user.role})
  }
  catch(err){
    console.log(err);
    res.status(502).json(err)
  }
})

module.exports = router