function getParams(name) {
  var idx = document.URL.indexOf('?');
  var params = {};
  if (idx != -1) {
      var pairs = document.URL.substring(idx + 1, document.URL.length).split('&');
      for (var i = 0; i < pairs.length; i++) {
          nameVal = pairs[i].split('=');
          params[nameVal[0]] = nameVal[1];
      }
  }
  return params[name];
}


function addInitialRows(testCases, owner){ // For creating the table to show test case results
  let tbody = document.getElementById("resultsBody")
  
  console.log("test cases = ", testCases)
  for(let testCase in testCases){
    console.log("testcase = ", testCase, owner)
    let tr = document.createElement("tr")
    tr.setAttribute("id", `testCase${testCount}`);
      tr.innerHTML = `
        <td># Test Case-${testCount}</td>
        <td>
          ${testCaseBoxes("ques", testCase, owner)}
        </td>
        <td>
          ${testCaseBoxes("ans", testCases[testCase], owner)}
        </td>
        <td>0.00</td>
        <td>
          ${testCaseBoxes("minus", "", owner)}
        </td>
      `
  
    testCount += 1
    tbody.append(tr)
  }
}

function testCaseBoxes(types, elem, owner){
  if (owner==true){
    if (types=="ques"){
      return `<textarea id="ques${testCount}" style="min-height: 100px">${elem}</textarea>`
    }
    else if(types=="ans"){
      return `<textarea id="ans${testCount}" style="min-height: 100px">${elem}</textarea>`
    }
    else{
      return `<img style="height: 40px" src="images/minus.png" onclick="removeElement('testCase'+${testCount})">`
    }
  }
  else{
    if (types=="ques"){
      return `<textarea id="ques${testCount}" style="min-height: 100px" readonly>${elem}</textarea>`
    }
    else if(types=="ans"){
      return `<textarea id="ans${testCount}" style="min-height: 100px" readonly>${elem}</textarea>`
    }
  }
}


async function editQuestion(){
    const questionID = await getParams("question")
    const question = document.getElementById("questionBox").value
    let testCases = {}

    const quesTag = document.getElementById("tagContent").innerText
    console.log("quesTag = ", quesTag, quesTag=="", quesTag==" ", quesTag=="\n");
    if (quesTag=="\n"){
      alert("Please alert a non-empty tag")
      return null
    }

    if (question.length<50){
      alert("Please Enter more than 50 words in the Question Statement")
      return null
    }

    console.log("testCount = ", testCount);

    for (let num=1; num <= testCount; num++) {
        let ques = document.getElementById(`ques${num}`);
        if (ques==null){
            continue
        }
        let ans = document.getElementById(`ans${num}`);
        testCases[ques.value] = ans.value
    }

    const customInput = document.getElementById("customInput").value
    const customOutput = document.getElementById("customOutput").value

    const initialCode = btoa(unescape(encodeURIComponent(window.editor.getValue())));

    const body = JSON.stringify({
        "id": questionID,
        "data": {
            "statement": question,
            "testCases": testCases,
            //userId: String,
            "marks": 100,
            //testCases: Object,
            //statement: String,
            "initialCode": initialCode,
            "initialTest": customInput,
            "initialAns": customOutput,
            "tag": quesTag
        }
    })

    console.log("body = ", body)

    const url = "/editQuestion"

    const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: body
      };
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      alert("Question Edited Successfully")
}


async function newQuestion(){

  const body = JSON.stringify({
      "data": {
          "marks": 100,
          "statement": "Please Enter some text here"
      }
  })

  console.log("body = ", body)

  const url = "/addQuestion"

  const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    };
    const response = await fetch(url, options);
    const result = await response.json();
    console.log("result = ", result);
    window.location.href = `/addQuestion?question=${await result["data"]._id}`;
    return await result["data"]._id
}

async function getAllQuestions(){
    let url = "/question"

    tag = getParams("tag")

    if (tag!=undefined){
      url += `?tag=${tag}`
    }

    const options = {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "Content-Type": "application/json"
        }
      };
      const response = await fetch(url, options);
      const result = await response.json();
      console.log("all questions = ", result);
      return result.data
}

async function allSolvedQuestions(){
  const url = "/solvedQuestions"

  const options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(url, options);
    const result = await response.json();
    console.log("all questions = ", result);
    return result.data
}

let questionCount = 0

function addQuestionRows(questions, owner){ // For creating the table to show test case results
  let tbody = document.getElementById("resultsBody")
  console.log("questions = ", questions)
  for (let index in questions){
    let question = questions[index]
    console.log("question = ", question)
    questionCount += 1
    let tr = document.createElement("tr")
    //tr.setAttribute("id", `testCase${testCount}`);
    tr.innerHTML = `
      <td>${questionCount}</td>
      <td>
        ${questionLink(owner, question)}
      </td>
      <td>
        ${question.marks}
      </td>
    `
    tbody.append(tr)
  }
}

function questionLink(owner, question){
  let statement = question.statement
  if (question.statement.length>50){
    statement = question.statement.slice(0, 50)
  }
  console.log(question.statement.length, statement.length)
  if (owner==true){
    return `<a href="/addQuestion?question=${question._id}">${statement}</a>`
  }
  else{
    return `<a href="/ViewQuestion?question=${question._id}">${statement}</a>`
  }
}

let initialCode = ""


async function loadQuestion(owner=false){
  const questionID = await getParams("question")
  const url = `/question?quesID=${questionID}`
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };
  const response = await fetch(url, options);
  const result = await response.json();
  console.log("question = ", result);

  let question = document.getElementById("questionBox")
  question.value = result.data.statement

  let testCases = result.data.testCases

  console.log("testCases = ", testCases)

  console.log("testCount = ", testCount);
  
  addInitialRows(testCases, owner);

  let customInput = document.getElementById("customInput")
  let customOutput = document.getElementById("customOutput")

  //document.getElementById("tagContent").innerText = result.data.tag

  customInput.value = result.data.initialTest  
  customOutput.value = result.data.initialAns

  initialCode = decodeURIComponent(window.atob(result.data.initialCode));
  console.log("initialCode = ", initialCode);
  setTimeout(setCode, 5000);

  return result.data.tag
}

function setCode(){
  console.log("code in setcode", initialCode, window.editor.value)
  //window.editor.value = initialCode;
  window.editor.getModel().setValue(initialCode);
}