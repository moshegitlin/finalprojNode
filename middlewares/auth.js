const jwt = require("jsonwebtoken");
const {config} = require('./secret')

exports.auth = (req,res,next) => {
    let token = req.header("x-api-key");
    if(!token){
        return res.status(401).json({msg:"You must send token in the header to this endpoint"})
    }
    try{
        req.tokenData = jwt.verify(token, config.tokenSecret);
        next();
    }
    catch(err){
        return res.status(401).json({msg:"Token invalid or expired"})
    }
}
