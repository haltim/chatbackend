const express = require("express");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../modal/User");
const router = express.Router();

// Middleware
router.use(express.json());

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Signup route
router.post(
  "/signup",
  validate([
    check("username", "Please Enter a Valid Username").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({ min: 6 }),
  ]),
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User Already Exists" });
      }

      user = new User({ username, email, password });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = { user: { id: user.id } };
      const secretKey = process.env.JWT_SECRET_KEY || "abc123";
      jwt.sign(
        payload,
        secretKey,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);


// Login route
router.post(
  "/login",
  validate([
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({ min: 6 }),
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "User Not Registered" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Incorrect Password" });
      }
      const payload = { user: { id: user.id } };
      const secretKey = process.env.JWT_SECRET_KEY || "abc123";
      jwt.sign(
        payload,
        secretKey,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);


// Change password route
router.put(
  "/change-password",
  validate([
    check("password", "Please enter a valid password").isLength({ min: 6 }),
  ]),
  async (req, res) => {
    try {
      const { userId, password } = req.body;


      let user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ msg: "User Not Found" });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;

      await user.save();

      res.status(200).json({ msg: "Password Changed Successfully" });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Delete account route
router.delete("/delete-account", async (req, res) => {
  try {
    // Retrieve user ID from request body
    const { userId } = req.body;

    // Find and delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Export the router
module.exports = router;