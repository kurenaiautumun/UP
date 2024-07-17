const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const userSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  role: String,
  info: String,
  referral: Number,
  pp: String,
  email: String,
  password: String,
  verified: Boolean,
  followers: Array,
  following: Array,
  recommendation: Array,
  userPoints: Number,
  totalEarn:{type:Number,default:0},
  started: Boolean,
});

const result = userSchema.index({ email: 1 }, { unique: true })
const username = userSchema.index({ username: 1 }, { unique: true })

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "unorthodoxprofessional@gmail.com",
      pass: process.env.PASSWORD,
    },
  });


const referralSchema = new mongoose.Schema({
  userId: String,
  referralArray: Array,
  hisReferral: Number
});

const socialShareSchema = new mongoose.Schema({
  user: String,
  ip: String,
  blogId: String
})

const socialUserReg = new mongoose.Schema({
  user: String,
  referrer: String
})

const ipSet = new mongoose.Schema({
  userId: String,
  ip: String
})

// For storing a questio  to load it later on
const questionSchema = new mongoose.Schema({
  userId: String,
  marks: Number,
  testCases: Object,
  statement: String,
  initialCode: String,
  initialTest: String,
  initialAns: String,
  testSeries: String,
  tag: String
})

// Store what questions a user has solved along with the marks in that
const UserSolutionSchema = new mongoose.Schema({
  userId: String,
  questionId: String,
  questionTag: String,
  marks: Number,
  breakdown: Object,
  statement: Object
})

// Similar to stories we can use this to create a test series of questions and assign a rating or marks to it
const testSchema = new mongoose.Schema({
  title: String,
  author: String,
  userId: String,
  chapters: Object,
  titleImage: String,
  description: String,
  tags: [String],
  rating: Number,
  Likes: Number,
  Views: Number,
  multiple: Boolean
}, { timestamps: true });

// Store the individual score of users according to their test performance
const testScoreSchema = new mongoose.Schema({
  userId: String,
  marks: Number,
  attempt: Number
}, {timestamps: true});


const User = new mongoose.model("User", userSchema);
const Referral = new mongoose.model("raferral", referralSchema);
const socialShare = new mongoose.model("socialShare", socialShareSchema)
const socialReg = new mongoose.model("socialReg", socialUserReg)
const ipSetTable = new mongoose.model("ipSet", ipSet)

const Question = new mongoose.model("question", questionSchema);
const UserSolutions = new mongoose.model("UserSolutions", UserSolutionSchema);

const Tests = new mongoose.model("Tests", testSchema);
const testScores = new mongoose.model("testScores", testScoreSchema);
//const questionSchema = new mongoose.Schema({
//    
//})

module.exports = {
    User,
    Referral,
    socialReg,
    socialShare,
    ipSetTable,
    transporter,
    Question,
    UserSolutions,
    Tests,
    testScores
  };