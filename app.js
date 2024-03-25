const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const { routesInit } = require("./routes/configRoutes");

const app = express();
require("./db/mongoConnect");
// Allows each domain to make requests to our server
app.use(cors());
// Defines to the server that it can receive information of type Jason in Buddy in requests that are not get
app.use(express.json());

// Makes sure that the public folder and all the files in it are exposed on the client side
app.use(express.static(path.join(__dirname, "public")));
// Initialize routes
routesInit(app);
const server = http.createServer(app);
const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;