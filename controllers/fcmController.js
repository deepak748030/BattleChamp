const Fcm = require('../models/fcm');

const saveFcmController = async (req, res) => {
    try {

        const { fcmToken, userId } = req.body;
        if (!fcmToken || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const fcm = new Fcm({
            fcmToken,
            userId
        });

        await fcm.save();

        res.status(201).json({ message: "Fcm Token saved successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}




module.exports = { saveFcmController };