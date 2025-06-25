const express = require('express');
const { Account } = require('../db');
const { authMiddleware } = require('../middleware');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/balance', authMiddleware, async (req,res) => {
    const user = await Account.findOne({
        userId: req.userId
    })
    if(user){
        return res.json({
            balance: user.balance
        })
    }
    res.status(404).json({
        message: "Account not found"
    })
})

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { amount, to } = req.body;

        await session.withTransaction(async () => {
            const account = await Account.findOne({ userId: req.userId }).session(session);

            if (!account || account.balance < amount) {
                throw new Error("Insufficient balance");
            }

            const toAccount = await Account.findOne({ userId: to }).session(session);

            if (!toAccount) {
                throw new Error("Invalid account");
            }

            await Account.updateOne(
                { userId: req.userId },
                { $inc: { balance: -amount } }
            ).session(session);

            await Account.updateOne(
                { userId: to },
                { $inc: { balance: amount } }
            ).session(session);
        });

        res.json({
            message: "Transfer successful"
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;