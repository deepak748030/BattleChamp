const JWT = require("jsonwebtoken");
const admin = require("../models/admin.js");

//Protected Routes token base
exports.requireSignIn = async (req, res, next) => {
    try {
        const decode = JWT.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        );
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: "Invalid Token",
        });
    }
};

//admin acceess
exports.isAdmin = async (req, res, next) => {
    try {
        const user = await admin.findById(req.user.id);
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "UnAuthorized Access",
            });
        } else {
            next();

        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            error,
            message: "Error in admin middelware",
        });
    }
};