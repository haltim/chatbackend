const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
require("dotenv").config();

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

mongoose
  .connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
})
const User = new mongoose.model("User", userSchema)
// Route

app.get("/", (req, res) => {
  res.send("My app")
})
// post 
app.post("/login", (req, res) => {
  const { email, password } = req.body
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      if (password === user.password) {
        res.send({ massage: "login successfull", user: user })
      } else {
        res.send({ massage: "password did't match" })
      }

    } else {
      res.send({ massage: "User not registered" })
    }
  })

})

app.post("/register", (req, res) => {
  const { username, email, password } = req.body
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ massage: "Already Registerd" })
    } else {
      const user = new User({
        username,
        email,
        password
      })
      user.save(err => {
        if (err) {
          res.send(err)
        } else {
          res.send({ message: "Successfully Registered ->Please login!!" })
        }
      })
    }
  })

})

app.listen(8000, () => {
  console.log("DB successfully started on port 8000")
})