const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
module.exports.registerUser = async function (req, res) {
  try {
    let { email, password, fullname } = req.body;
    if (!password) {
      req.flash("error", "Password is required");
      return res.redirect("/my-account");
    }
    let user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      req.flash("error", "Email already exists");
      return res.redirect("/my-account");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      fullname,
    });

    let token = generateToken(newUser);
    res.cookie("token", token);
    req.flash("success", "Account created successfully!  You can login");
    return res.redirect("/my-account");
  } catch (err) {
    console.error("Register Error:", err.message);
    req.flash("error", "Something went wrong during registration");
    return res.redirect("/my-account");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;
    if (!password) {
      req.flash("error", "Password is required");
      return res.redirect("/my-account");
    }
    let user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      req.flash("error", "email or password incorrect  ");
      return res.redirect("/my-account");
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        let token = generateToken(user);
        res.cookie("token", token);
        return res.redirect("/");
      } else {
        req.flash("error", "email or password incorrect ");
        return res.redirect("/my-account");
      }
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    req.flash("error", "Something went wrong during login");
    return res.redirect("/my-account");
  }
};
module.exports.logoutUser = function (req, res) {
  res.cookie("token", "");
  return res.redirect("/my-account");
};

module.exports.forgotPass = function (req, res) {
 //forgot pass logic
};