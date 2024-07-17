const express = require("express");
const router = express.Router();
//const { date, User, Blog, monthlyViews, viewAnalysis,popularBlogs, userViewCounts, userPoints} = require("../models.js");
//const { encrypt, decrypt } = require("./encrypt.js");
const jwtVerify = require("./jwt")

const {Question, UserSolutions} = require("../models.js")


router.get('/session', (req, res) => {
  if (req.session.view) {
      // The next time when user visits, 
      // he is recognized by the cookie 
      // and variable gets updated.
      req.session.view++;
      res.send("You visited this page for "
          + req.session.view + " times - " + req.session.token + " + " + req.session.jwt + req.session.jaq);
  }
  else {
      // If user visits the site for
      // first time
      req.session.view = 1;
      req.session.jwt = "a"
      res.send("You have visited this page"
         + " for first time ! Welcome....");
  }
})


// Will run on every API request and then check if session is in notice or not
router.use((req, res, next) => {
  console.log("path = ", req.originalUrl)
  not = ["/", "home", "/read", "/author", "/userProfile", "/current_user"]
  let url = req.originalUrl.split("?")
  console.log("url = ", url,url[0])
  if (not.includes(url[0])==true){
    console.log(url[0], " is exempted from check")
    next();
    console.log("after first next")
    return null
  }
  console.log('Time:', Date.now())
  let user = jwtVerify(req);
  console.log("user in middle = ", user)
  if (user==null){
    if (not.includes(url[0])==false){
      res.redirect("/login");
      return null
    }
    else{
      console.log("not redirecting here");
      next();
      console.log("after 2 next")
      return null
    }
  }
  console.log("before last next")
  next();
  console.log("after last next")
})


router.get("/question", async (req, res)=>{
    console.log("params = ", req.query)
    let quesID = req.query.quesID;
    let tag = req.query.tag;
    let msg = ""
    if (quesID!=null){
      ques = await Question.findOne({_id: quesID})
      ques = ques.toObject();
      msg = `Question with ID - ${quesID}`
      owner = false
      let user = jwtVerify(req);
      if (user.user._id==ques.userId){
        owner = true
      }
      ques["owner"] = owner
    }

    else if (tag!=null){
      ques = await Question.find({tag: tag})
      msg = `All Tagged Questions with tag - ${tag}`
    }

    else{
      ques = await Question.find()
      msg = "All Saved Questions"
      //for (que in await ques){
      //  console.log("que = ", ques[que])
      //  if (ques[que].statement==null){
      //    await ques[que].deleteOne();
      //  }
      //}
    }

    context = {
      "data": ques,
      "msg": msg
    }

    console.log("ques = ", ques);

    res.json(context).status(200);
    return null
  })

router.get("/questions", (req, res)=>{
  res.render("all_questions")
})

router.get("/MyQuestions", (req, res)=>{
  res.render("all_questions")
})

router.get("/addQuestion", (req,res)=>{
  res.render("addQuestion", {owner:"True"})
})

router.get("/ViewQuestion", (req,res)=>{
  res.render("addQuestion", {owner:"False"})
})

router.post("/addQuestion", async (req,res)=>{
  let user = jwtVerify(req);
  console.log("user = ", user)
  if (user.user==null){
    res.render("/login");
    return null
  }
  let data = req.body.data
  console.log("data = ", req.body.data)

  data["userId"] = user.user._id // Add userId here 

  let question = await new Question({
    userId: data.userId,
    marks: data.marks,
    testCases: data.testCases,
    statement: data.statement,
    initialCode: data.initialCode,
    initialTest: data.initialTest,
    initialAns: data.initialAns,
    tag: "General"
  })

  question.save()

  let msg = {
    "msg": "Your question has been saved succefully",
    "data": question
  }

  res.json(msg).status(201);
  return null
})


router.post("/editQuestion", async (req,res)=>{
  let user = jwtVerify(req);
  console.log("user = ", user)
  if (user.user==null){
    res.render("/login");
    return null
  }
  let data = req.body.data
  console.log("data = ", req.body)

  data["userId"] = user.user._id // Add userId here 

  const questionID = req.body.id;

  let question = await Question.findOne({_id: questionID})

  console.log("question = ", questionID, await question)

  question.marks = data.marks,
  question.testCases = data.testCases,
  question.statement = data.statement,
  question.initialCode = data.initialCode,
  question.initialTest = data.initialTest,
  question.initialAns = data.initialAns 
  question.tag = data.tag
  question.save()

  let msg = {
    "msg": "Your question has been saved succefully",
    "data": question.id
  }

  res.json(msg).status(200);
  return null
})

router.post("/questionScore", async (req, res)=>{
  let user = jwtVerify(req);
  console.log("user = ", user)
  if (user.user==null){
    res.render("/login");
    return null
  }
  console.log("data = ", req.data)
  console.log("body = ", req.body)
  console.log("scores = ", req.body.scores)
  console.log("quesId = ", req.body.quesId)

  const userId = user.user._id // Add userId here 

  const scores = req.body.scores // json from fontend
  let total_tests = 0
  let passed = 0
  for (let score in scores){
    if (scores[score]==true){
      passed += 1
    }
    total_tests += 1
  }
  let marks = 0;
  console.log(((passed==0)&&(total_tests==0)))
  if ((passed==0)&&(total_tests==0)){
    marks = 0
  }
  else{
    marks = (passed/total_tests)*100
  }

  console.log("marks = ", marks, passed, total_tests)
  // UserSolutions.deleteMany({}).exec()  Temporarily delete all rows before this
  let userSolution = new UserSolutions({
    userId: userId,
    questionId: req.body.quesId,
    questionTag: "General",
    statement: req.body.statement,
    marks: marks,
    breakdown: scores
  })
  console.log("userSolution = ", userSolution)
  userSolution.save() // Save the object
  res.status(200).json("User score saved successfully")
})


module.exports = router