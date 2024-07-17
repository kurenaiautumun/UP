const express = require("express");
const router = express.Router();
const jwtVerify = require("./jwt")

const { encrypt, decrypt } = require("./encrypt.js");

const {User, UserSolutions} = require("../models.js");
const { render } = require("ejs");

router.get("/userProfile", (req, res)=>{
    res.render("userProfile")
})

router.post("/userProfile", async (req, res)=>{
    let userId = decrypt(req.body.userId)
    let user = await User.findOne({_id: userId})
    if (user==null){
        res.json('No User exists by this ID')
    }
    let solvedQuestions = await UserSolutions.find({userId: userId})

    let context = {
        "userData": user,
        "solvedQuestions": solvedQuestions
    }
    //console.log("context = ", context)
    res.json(context).status(200);
})

router.post("/current_user", async (req, res)=>{
    console.log("current user")
    let user = jwtVerify(req);
    console.log("user after jwt = ", user)
    if (user==null){
      res.json(null).status(404);
      return null;
    }

    let userObj = await User.findOne({_id: user.user._id})
    userObj = await userObj.toObject();
    userObj._id = encrypt(userObj._id)
    res.json(userObj).status(200);
})


module.exports = router