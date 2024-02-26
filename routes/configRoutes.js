const indexR = require("./index");
const usersR = require("./users");
const toysR = require("./toys");

exports.routesInit = (app) => {
    app.use("/",indexR);
    app.use("/users",usersR);
    app.use("/toys",toysR);
    app.use("*",(req,res) => {
        res.status(404).json({msg:"Page/endpoint not found, 404"})
    })
}