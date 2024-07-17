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

async function userProfile(){
    const userId = await getParams("userId")

    const body = JSON.stringify({"userId": userId})

    console.log("body = ", body)

    const url = "/userProfile"

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

    let name = document.getElementById("userName")
    name.value = result["userData"]["username"]
    //solvedQuestions.value = result["solvedQuestions"]

    return await result["solvedQuestions"]
}