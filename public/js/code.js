let selectedLanguage = "python";
  let languageCode = 71
  let languageDict = {}
  let token = null

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

  const removeElement = (el) => {
    console.log("element = ", el);
    el.parentNode.removeChild(el);}

  function quesEdit(inputs){
    let code = window.editor.getValue()
    let tests =  Object.keys(allCases).length
    //code += `\nmain(inputs="${inputs.replace(/\n/g, ",")}")`
    return code;
  }

  async function compilation(){
    const url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&fields=*";
    //console.log(window.editor.getValue())

    let text = document.getElementById("customInput").value
    console.log("text = ", text)
    console.log("language code = ", languageCode)
    let encodedStdin = btoa(unescape(encodeURIComponent(text)));//Base64.encode(editor.innerText);

    let question = quesEdit(text)

    console.log("question = ", question)

    let encodedString = btoa(unescape(encodeURIComponent(question)));//Base64.encode(editor.innerText);
      const body = JSON.stringify({
        language_id: languageCode,
        source_code: encodedString,
        stdin: encodedStdin
      })

    console.log("body = ", body)

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "64aa6b24d2msh22d5a0cb438b9b2p1e6dc0jsn11c105dc81d4",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: body

    };
    //console.log("encoded = ", encodedString);
//
    try {
    	const response = await fetch(url, options);
    	const result = await response.json();
    	console.log(result);

      if (await result["token"]!=null){
        token = result["token"]
        setTimeout(getAnswer, 2000)
      }
    } catch (error) {
    	console.error(error);
    }
  }

  async function getAnswer(){
    let url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=token,stdout,stderr,status_id,language_id,time`
    const options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "64aa6b24d2msh22d5a0cb438b9b2p1e6dc0jsn11c105dc81d4",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
    };
    try {
    	const response = await fetch(url, options);
    	const result = await response.json();
    	console.log(result);
      let customOut = document.getElementById("customOutput");
      if (result["stderr"]==null){
        customOut.value = result["stdout"]  
      }
      else{
        customOut.value = result["stderr"]
      }
    } catch (error) {
    	console.error(error);
    }
  }
  function addRow(){ // For creating the table to show test case results
    let tbody = document.getElementById("resultsBody")
    let tr = document.createElement("tr")
    tr.setAttribute("id", `testCase${testCount}`);
      tr.innerHTML = `
        <td># Test Case-${testCount}</td>
        <td>
          <textarea id="ques${testCount}" style="min-height: 100px"></textarea>
        </td>
        <td>
          <textarea id="ans${testCount}" style="min-height: 100px"></textarea>
        </td>
        <td>0.00</td>
        <td><img style="height: 40px" src="images/minus.png" onclick="removeElement('testCase'+${testCount})"></td>
      `
    testCount += 1
    tbody.append(tr)
  }


  function generatingTable(answers){ // For creating the table to show test case results
    removeElement(document.getElementById("resultsTestBody"));
    let table = document.getElementById("resultsTest")

    let tbody = document.createElement("tbody")
    tbody.setAttribute("id", "resultsTestBody")
    let count = 1
    all_scores = {} // Store whether individual Test Cases are wrong or right, This is for backend functioning
    for (let ans in answers){
      console.log(answers[ans], allCases[ans], answers[ans]==allCases[ans])
      let tr = document.createElement("tr")
      if (answers[ans]==allCases[ans]){
        status = "Pass"
        all_scores[ans] = true
        tr.innerHTML = `
          <td># Test Case-${count}</td>
          <td style="color:green">${status}</td>
          <td>0.00</td>
        `
      }
      else{
        status = "Fail"
        all_scores[ans] = false
        tr.innerHTML = `
          <td># Test Case-${count}</td>
          <td style="color:red">${status}</td>
          <td>0.00</td>
        `
      }
      count += 1
      tbody.append(tr)
    }
    table.append(tbody)
    submitScore(all_scores)
  }

  async function submitScore(scores){
    const questionId = await getParams("question")
    const url = "/questionScore"

    const statement = document.getElementById("questionBox").value

    // Score and their breakdown
    const body = JSON.stringify({
      "scores": scores,
      "quesId": questionId,
      "statement": statement
    })

    console.log("body = ", body)

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        //"X-RapidAPI-Key": "64aa6b24d2msh22d5a0cb438b9b2p1e6dc0jsn11c105dc81d4",
        //"X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: body
    }

    try {
    	const response = await fetch(url, options);
    	const result = await response.json();
    	//console.log("all languages = ", result);
      setAllLanguages(result);
    } catch (error) {
    	console.error("all languages =", error);
    }
  }

  
  async function getAnswers(tokens){
    let url = `https://ce.judge0.com/submissions/batch?tokens=${tokens}&base64_encoded=false&fields=token,stdout,stderr,status_id,language_id,time`
    const options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "64aa6b24d2msh22d5a0cb438b9b2p1e6dc0jsn11c105dc81d4",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
    };
    try {
    	const response = await fetch(url, options);
    	const result = await response.json();
    	console.log(await result);
      let answers = {}
      count = 0
      subs = await result["submissions"]
      for (let ans in allCases){
        answers[ans] = await subs[count]["stdout"]
        count += 1
      }
      console.log("answers = ", answers)
      generatingTable(answers)
    } catch (error) {
    	console.log("error = ", error);
    }
  }

  let allCases = {}

  async function testCases(){
    // Get all the Test cases and use them in submit code
    let testCases = {}
    for (let num=1; num <= testCount; num++) {
      let ques = document.getElementById(`ques${num}`);
      if (ques==null){
          continue
      }
      let ans = document.getElementById(`ans${num}`);
      console.log("testCase = ", ques, ans)
      testCases[ques.value] = ans.value
    }
    return testCases
  }

  async function submitCode(){
    const url = "https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=true&fields=*";
    //console.log(window.editor.getValue())

    let encodedString = btoa(unescape(encodeURIComponent(window.editor.getValue())));//Base64.encode(editor.innerText);

    let batchBody = {
      "submissions": []
    }

    allCases = await testCases();
    console.log("allCases = ", await allCases)
    for (cases in await allCases){
      let encodedStdin = btoa(unescape(encodeURIComponent(cases)));//Base64.encode(editor.innerText);
      batchBody["submissions"].push({
        language_id: languageCode,
        source_code: encodedString,
        stdin: encodedStdin
      })
    }

    const body = JSON.stringify(
      batchBody
    )

    console.log("body = ", body)

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "64aa6b24d2msh22d5a0cb438b9b2p1e6dc0jsn11c105dc81d4",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      },
      body: body

    };
    //console.log("encoded = ", encodedString);
//
    try {
    	const response = await fetch(url, options);
    	const result = await response.json();
    	console.log(result);
      let tokens = ""
      for (let token in result){
        console.log("token, result = ", token, result[token])
        tokens += result[token].token + ","
      }
      tokens = tokens.slice(0, -1); 
      console.log("tokens = ", tokens)
      if (await result!=null){
        getAnswers(tokens);
      }
    } catch (error) {
    	console.error(error);
    }
  }


  function changeLanguage(){
    // For changing the language after one time
    console.log("changing language")
    let language = document.getElementById("languageSelector").value
    console.log("selected language = ", language)

    languageCode = languageDict[language]
    console.log("selected language ID = ", languageCode)

    let lowerLanguage = language.toLowerCase();
    console.log("lower language = ", lowerLanguage)

    let editor = document.getElementById("monacoEditor")

    allowed = ["python", "java", "javascript", "c++"]

    selection = ""

    for (name in allowed){
      if (lowerLanguage.includes(allowed[name])){
        console.log("editor = ", editor)
        selection = allowed[name]
        // editor.setAttribute("language", allowed[name])
        //let elem = document.getElementById("editorHolder")
        //elem.innerHTML = `<wc-monaco-editor id="monacoEditor" style="min-height: 400px;" language="${allowed[name]}" fontSize="16"></wc-monaco-editor>`
      }
    }
    if (selection!=""){
      selectedLanguage = selection
    }
    showModal();
  }

  function showModal(){
    var modal = document.getElementById("myModal_new");
    modal.style.display = "grid";
}

function closeModal(){
    var modal = document.getElementById("myModal_new");
    modal.style.display = "None";
}

  function changeCode(option){
    console.log("selection = ", selection, editor_uri)
    if (option==true){
        let model = window.editor.getModel(window.editor.uri)
        console.log("model = ", model)
        monaco.editor.setModelLanguage(model, selection);
        //window.editor.updateOptions({
        //  language: selection  // or whatever language you need here, javascript, or go or whatever
        //});
        // console.log(`model language was changed to ${model.getLanguageIdentifier().language}`);
    }
    console.log(window.editor._configuration._rawOptions.language)
    closeModal();
  }

  async function setAllLanguages(languages){
    let llist = document.getElementById("languageSelector")
    for (language in languages){
      //console.log("language = ", language, languages[language])
      let options = document.createElement("option")
      options.innerHTML = languages[language]["name"]
      languageDict[languages[language]["name"]] = languages[language]["id"]
      llist.append(options)
    }
  }

  // Get all Languages available for compilation
  async function getAllLanguages(){
      const url = "https://ce.judge0.com/languages/all"
      const options = {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "Content-Type": "application/json",
          //"X-RapidAPI-Key": "64aa6b24d2msh22d5a0cb438b9b2p1e6dc0jsn11c105dc81d4",
          //"X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
      }
      try {
      	const response = await fetch(url, options);
      	const result = await response.json();
      	//console.log("all languages = ", result);
        setAllLanguages(result);
      } catch (error) {
      	console.error("all languages =", error);
      }
    }
  getAllLanguages();