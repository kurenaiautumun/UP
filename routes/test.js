const express = require("express");
const router = express.Router();
const jwtVerify = require("./jwt")

const {Tests, testScores, Question, User} = require("../models.js")
const {encrypt, decrypt} = require("./encrypt")


router.post("/newTest", async (req, res)=>{
    let token = jwtVerify(req);
    let userId = token.user._id
  
    console.log("userId = ", userId)
  
    if (userId==null){
        res.render("login")
        return null
    }
  
    let title = req.body.title
  
    console.log("title = ", title)
  
    let user = await User.findOne({_id:userId}) //find user using UserId
  
    console.log("user = ", user)
  
    newTest = new Tests({
        name: await user.username,
        userId: await user._id,
        title: title,
        titleImage: "https://kurenai-image-testing.s3.ap-south-1.amazonaws.com/logo-removebg-preview.png",
        chapters: {},
        finished: false,
        author: user.username,
        description: "",
        tags:["test"],
        rating: 0,
        Likes: 0,
        Views: 0
    })
  
    newTest.save();
  
    res.status(200).json({"msg": `Tests with Title - ${newTest} has been created`, "title": newTest.title})
  })
  
  router.put("/addChapter", async (req, res)=>{
    let token = jwtVerify(req);
    let userId = token.user._id
  
    let quesId = req.body.ques
  
    console.log("quesId = ", quesId);
  
    let quesObj = await Question.findOne({_id: quesId})
 
    console.log("quesObj = ", quesObj);
    
    let ques = {
        "statement": await quesObj.statement,
        "_id": await quesObj._id,
        "titleImage": await quesObj.titleImage
    }
  
    console.log("ques = ", ques)
  
    let testName = req.body.testName

    testName = Buffer.from(testName, 'base64').toString('ascii')
  
    let test = await Tests.findOne({title: testName})
  
    console.log("old test = ", await test)
  
    chapters = test.chapters
  
    if (await chapters==undefined){
        chapters = {}
        chapters[ques._id] = {
                "ques": ques,
                "number": 1
            }
    }
    else{
        chapters[ques._id] = {
            "ques": ques,
            "number": Object.keys(test.chapters).length + 1
        }
    }
  
    console.log("chapters = ", chapters)
  
    let doc = await Tests.findOneAndUpdate({title: testName}, {chapters: chapters}, {new: true});
  
    console.log("doc = ", doc)
  
    test.save()
  
    let data = chapters[ques._id] 
  
    quesObj.test = test._id
    quesObj.save()
  
    res.status(200).json({"msg": "Chapter Added Successfully", "data": data})
  })
  
  router.get("/test/:title", async (req,res)=>{
    let title = req.params.title
    title = Buffer.from(title, 'base64').toString('ascii')
    console.log("title = ", title)
    let test = await Tests.findOne({title: title})
    //story = story.toObject()
  
    //for (let key in story.chapters){
    //    story.chapters[key]["title"] = await Blog.findOne({_id: key}).title
    //    console.log('key = ', key, await Blog.findOne({_id: key}).title, await Blog.findOne({_id: key}))
    //}
  //
    console.log("test = ", test)
  
    res.render("test", test)
  })
  
  router.post("/test/:title", async (req,res)=>{
    let title = req.params.title
    title = Buffer.from(title, 'base64').toString('ascii') // Decode into ascii from base64

    let test = await Tests.findOne({title: title})
    test = test.toObject();

    console.log("user = ", await test["userId"], test);

    test["title"] = Buffer.from(test["title"]).toString('base64')

    test["userId"] = encrypt(test["userId"]);
  
    for (let key in test.chapters){
        let ques = await Question.findOne({_id: key})
        test.chapters[key]["ques"]["statement"] = await ques.statement
        test.chapters[key]["ques"]["titleImage"] = await ques.titleImage
        test.chapters[key]["ques"]["status"] = await ques.status
        console.log('key = ', key, ques.title)
    }
  
    console.log("test in post = ", test)
  
    res.status(200).json(test)
  })
  
  router.put("/editTest", (req,res)=>{
    let token = jwtVerify(req);
    let userId = token.user._id
  
    let {title, finished, tags} = req.body;
  
    let test = Tests.findOne({title: testName, _id: userId})
  
    test.title = title,
    test.finished = finished,
    test.tags = tags
  
    test.save()
  
    res.status(200).json("Tests successfully edited")
  })
  
  
  router.get("/tests", async (req,res)=>{
    res.render("tests")
  })
  
  
  router.post("/tests", async (req,res)=>{
    let test = await Tests.find()

    test = test.map(function(model) { 
      return model.toObject(); 
    });

    for (i in test){
      test[i]["title"] = Buffer.from(test[i]["title"]).toString('base64')
    }

    console.log("all tests = ", test)
  
    res.status(200).json(test)
  })

module.exports = router