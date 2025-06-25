const express = require('express');
const router = express.Router();
const zod = require('zod');
const jwt = require('jsonwebtoken');
const { JWT_SECRET} = require("../config");
const { User, Account} = require("../db");
const { authMiddleware } = require("../middleware");

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

router.post("/signup", async (req,res) =>{
    const {success} = signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        username: req.body.username
    })
    if(existingUser){
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }
    const dbUser = await User.create({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    });
    await Account.create({
        userId: dbUser._id,
        balance:1 +  Math.random() * 10000
    })
    const token = jwt.sign({
        userId: dbUser._id,
    }, JWT_SECRET);
    res.json({
        message: "User created successfully",
        token: token
    })
})
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})
router.post("/signin", async (req,res) =>{
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            msg: "Incorrect Inputs"
        })
    }
    const existingUser = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })
    if(existingUser){
        const token = jwt.sign({
            userId: existingUser._id
        }, JWT_SECRET);
        res.json({
            token:token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })
})
const updateBody = zod.object({
    firstName: zod.string().optional(),
    password: zod.string().optional(),
    lastName: zod.string().optional()
})
router.put("/", authMiddleware, async (req,res)=> {
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Incorrect Inputs"
        })
    }
    await User.updateOne({_id: req.userId}, req.body);
    res.json({
        message: "User updated successfully"
    })
    
})
router.get("/bulk", async (req,res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })
    res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
module.exports = router;