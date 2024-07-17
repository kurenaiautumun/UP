const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtVerify = require("./jwt")
// For sending in email
const template = require("./template");

const { User, Referral, socialReg, socialShare, ipSetTable, transporter} = require("../models.js");

const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const bcrypt = require("bcryptjs");
const {encrypt, decrypt} = require("./encrypt")

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const crypto = require("crypto");
const { connected } = require("process");

const upload = multer(multer.memoryStorage());

//Referrer-Policy: no-referrer-when-downgrade. for google login localhost

async function updateReferral(id, user){
  await Referral.updateOne(
    { hisReferral: id },
    { $push: { referralArray: user } }
  );
}

router.get("/login", (req, res) => {
  console.log("session = ", req.session.jwt, req.session.view, req.session.jaq)
  res.render("login");
});

router.get("/google", (req, res) => {
  res.render("google");
});

router.get("/signup", function (req, res) {
    res.render("register");
  });
  
  router.post("/signup", async (req, res) => {
    console.log("req = ", req.body)
    try {
      const referralId = Math.floor(Math.random() * 10000000);
  
      let user = new User({
        username: req.body.username,
        email: req.body.email,
        verified: 0,
        role: req.body.role,
        firstName: "",
        lastName: "",
        pp: "https://kurenai-image-testing.s3.ap-south-1.amazonaws.com/logo-removebg-preview.png",
        referral: referralId,
      });

      let code = 201
      let msg = ""

      code, msg = await savingUser(user, req.body.password, referralId, req)

      console.log("code = ", code, msg)
    
      const mailData = {
        from: "autumnkurenai@gmail.com",
        to: req.body.email,
        subject: "Welcome to Kurenai",
        html: template,
      };
      res.status(code).json(msg)
      //await transporter.sendMail(mailData);
      return null
    }

    catch (err) {
      console.log("err = ", err)
      res.status(500).json({ error: err.message });
      return null
    }
  });


async function savingUser(user, pass, referralId, req){
  code = 200
  msg = ""
  bcrypt.hash(pass, 8, async function(err, hash) {
    if(err){
      res.status(400).json("not working").end()
    }
    user.password = hash
    //user.save()
    
    try{
      user = await user.save()
    }
    catch (err){
        console.log("err = ", err)
        if(err.toString().includes("username")){
          code = 400
          msg = `User with this Username already exists`
        }
        else{
          code = 400
          msg = `User with this Email address already exists`
        }
      }
    finally{
      console.log("user saved - ", await user)
      console.log(req.body.username)
    }

    const registeredUser = user

    console.log("registered user = ", registeredUser)

      //console.log("referall")
      //console.log("id = ", registeredUser._id)
    try{
      const referral = new Referral({
        userId: registeredUser._id,
        hisReferral: referralId,
        paid: false
      });
      referral.save();
      console.log("referral = ", referral)
    }
    catch(err){
      console.log("error = ", err)
      code = 404
      msg = "referral table could not be set up"
    }


    if (req.body.referral != undefined) {
      console.log("in referral")
      //console.log(Referral.findOne({hisReferral: req.body.referral}))
      try{
        updateReferral(req.body.referral, registeredUser);
      }
      catch(e){
        console.log("could not update referral = ", e)
      }
    }

    try{
      //console.log("ip = ", req.ip)
      let refferer = await socialShare.findOne({ip: req.ip})
      //console.log("refferer = ", refferer)
      reg = socialReg({
        user: registeredUser._id,
        referrer: await refferer.user
      })
      reg.save()
    }
    catch(err){
      console.log("New visitor", err)
    }

    try{
      let ip_analysis = new ipSetTable({
        userId: registeredUser._id,
        ip: req.ip
      })
      ip_analysis.save()
    }
    catch(err){
      console.log("IP could not be caught")
    }

    console.log("user at end = ", user)

    //convert to object first to be able to overwrite values
    
    user = user.toObject()

    user._id = encrypt(user._id)

    code = 201
    msg = user
  })
  console.log("code = ", code, "msg = ", msg)
  return await code, await msg
}

router.post("/googleLogin", async (req, res) => {
  console.log("body = ", await req.body)
  const name = req.body.name
  const email = req.body.email
  const picture = req.body.picture

  //console.log(name, email, picture)
  let msg
  let user = await User.findOne({email: email})
  let key = "already saved"

  //console.log("user = ", user)

  if(user){
    //console.log("user found")
    try{
      let ip_analysis = await ipSetTable({
        userId: await user._id,
        ip: req.ip
      })
      ip_analysis.save()
    }
    catch(err){
      console.log("IP could not be caught")
    }
    msg = 0
  }
  else{
    msg = 1
    //console.log("user not found")
    const referralId = Math.floor(Math.random() * 10000000);
    let name1 = name
    let names = await User.find({ "username": { "$regex": `${name}`, "$options": "i" }})

    console.log("names = ", await names)

    for (let i in await names){
      console.log("in count")
      name1 = `${name}${i}`
    }
    console.log("name1 = ", await name1)
    user = new User({
      username: await name1,
      role: "writer",
      email: email,
      verified: 0,
      referral: referralId
    })

    console.log("user = ", user)

    let pass = crypto.randomBytes(10).toString('hex');

    let code, msg = savingUser(user, pass, referralId, req)

    if (code!=201){
      res.status(code).json(ms)
      return null
    }

    const Key = `profile/images/${user.username}/profile.jpeg`;

    const res_pic = await fetch(picture)
    const blob = await res_pic.arrayBuffer()

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key,
      Body: await blob,
      ACL: "public-read",
    });

    await s3.send(command);

  key = `https://kurenai-image-testing.s3.ap-south-1.amazonaws.com/${Key}`
  user.pp = key
  user.save()
  }
  jwt.sign({ user: user }, "secretkey", async(err, token) => 
  {
    req.session.token = token
    res.status(200).json({
      _id: encrypt(user._id),
      success: msg,
      url: key,
      token: token
    });
  })
})

router.post("/login", async function (req, res) {
  //console.log("in login")
  //console.log("body = ", req.body)
  const user_obj = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  console.log("user = ", user_obj)
  console.log("user = ", await User.findOne({ username: user_obj.username }))
  console.log("user = ", await User.findOne({ email: user_obj.username }))
  console.log("user = ", await User.findOne({ $or: [{ username: user_obj.username }, { email: user_obj.username }] }))
  let user = await User.findOne(
    { $or: [{ username: user_obj.username }, { email: user_obj.username }] }
  );
  console.log("user = ", user)
  let token = null;
  if (user==null){
    res.status(404).json("No User found with this Email or Username")
  }
  else{
    console.log(user==null)
    user = user.toObject()
    console.log("password = ", user.password)
    //req.session.jaq = "a"
    let token = ""

    const result = await bcrypt.compare(req.body.password, user.password);

    if (result==true){
      let jwtSecretKey = process.env.SECRET;
      const token = jwt.sign({user: user}, jwtSecretKey);
      user["_id"] = encrypt(user._id)
      console.log(user._id)
      console.log(encrypt(user._id))
      req.session.token = token
    }
    else{
      res.status(400).json("Wrong Username/Email or Password Combination")
      return null
    }
    
    //bcrypt.compare(req.body.password, user.password).then(function(result) {
      // result == true
      //console.log("result = ", result)
    //});

    try{
      let ip_analysis = ipSetTable({
        userId: user._id,
        ip: req.ip
      })
      ip_analysis.save()
    }
    catch(err){
      console.log("IP could not be caught")
    }
    res.status(200).json({"user": user, "token": token});
    return null
  }
});


module.exports = router;