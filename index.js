const express = require("express");
const bodyParser = require("body-parser");
const InitiateMongoServer = require("./config/db");
const user = require("./router/user");
const cors = require("cors");
require('dotenv').config()

InitiateMongoServer();

const app = express();
app.use(cors());

// middleware
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});

// router

app.use("/user", user);

app.listen(process.env.PORT, (req, res) => {
  console.log(`Server Started at PORT ${process.env.PORT}`);
});