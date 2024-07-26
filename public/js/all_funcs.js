async function current_user(){
    const url = "/current_user"

    const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      };
      const response = await fetch(url, options);
      const result = await response.json();
      console.log("current_user = ", result);

      navbar = document.getElementById("header_nav")

      if (result==null){
        let li = document.createElement("li")
        li.setAttribute("class", "navigate_item")
        li.style.float = "right"
        li.innerHTML  = '<a href="/login">Login</a>'

        let li2 = document.createElement("li")
        li2.setAttribute("class", "navigate_item")
        li2.style.float = "right"
        li2.innerHTML  = '<a href="/signup">Signup</a>'

        navbar.append(li);
        navbar.append(li2);
      }

      else{
        let li = document.createElement("li")
        li.setAttribute("class", "navigate_item")
        li.style.float = "right"
        li.innerHTML  = `<a href="/userProfile?userId=${result._id}" id="aProfileSmall"><img src="images/profile.png" id="profileSmall"></a>`
        navbar.append(li)
      }
}

current_user();