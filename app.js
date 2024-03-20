const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const { routesInit } = require("./routes/configRoutes");

const app = express();
require("./db/mongoConnect");

// נותן אפשרות לכל דומיין לעשות בקשות לשרת שלנו
app.use(cors());
// מגדיר לשרת שהוא יכול לקבל מידע מסוג ג'ייסון בבאדי בבקשות שהם לא גט
app.use(express.json());


// דואג שתקיית פאבליק כל הקבצים בה יהיו חשופים לצד לקוח
app.use(express.static(path.join(__dirname, "public")));
// פונקציה שמגדירה את כל הראוטים הזמנים באפליקציית
// צד שרת שלנו
routesInit(app);
// catch 404 and forward to error handler
const server = http.createServer(app);
const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;