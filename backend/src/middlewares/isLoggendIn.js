const jwt = require("jsonwebtoken");
const userModel = require("../models/User");


module.exports = async function (req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        req.flash("error", "You need to login first.");
        return res.redirect("/login");
    }

    try {
        let decoded = jwt.verify(token, process.env.JWT_KEY);

        // Role ke basis par model select karo
        const model = decoded.role === "admin" ? adminModel : userModel;

        let user = await model
            .findOne({ email: decoded.email })
            .select("-password");

        if (!user) {
            res.clearCookie("token");
            req.flash("error", "User not found. Please login again.");
            return res.redirect("/login");
        }

        req.user = user;
        req.user.role = decoded.role;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        res.clearCookie("token");

        if (err.name === "TokenExpiredError") {
            req.flash("error", "Your session has expired. Please login again.");
        } else {
            req.flash("error", "Invalid token. Please login again.");
        }

        return res.redirect("/login");
    }
};