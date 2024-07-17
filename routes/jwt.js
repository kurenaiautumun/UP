const express = require("express")
const jwt = require("jsonwebtoken");

const router = express.Router();


  function jwtVerify(req){

    //console.log("jet started")

    let data = null

    let bearerHeader;
    let bearerToken;

    // Commenting these out just for testing and dev purposes
    //try{
    //  bearerHeader = req.headers["authorization"];
    //  bearerToken = bearerHeader.split(" ")[1];
    //}
//
    //catch(err){
    // console.log("there is no local token")
    //}
//
    //try{
    //  bearerToken = req.session.token
    //  console.log("session token is caught - ", req.session.token)
    //}
    //catch(err){
    //  console.log("session token is also null")
    //  return null
    //}

    bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY2MjRhY2U0NmExNDNlOWI5Njk3MDk0OCIsInVzZXJuYW1lIjoicmVmMTAyIiwiZmlyc3ROYW1lIjoiIiwibGFzdE5hbWUiOiIiLCJyZWZlcnJhbCI6NDkyNTIxNywicHAiOiJodHRwczovL2t1cmVuYWktaW1hZ2UtdGVzdGluZy5zMy5hcC1zb3V0aC0xLmFtYXpvbmF3cy5jb20vbG9nby1yZW1vdmViZy1wcmV2aWV3LnBuZyIsImVtYWlsIjoicmVmMTAyQHVwLmNvbSIsInZlcmlmaWVkIjpmYWxzZSwiZm9sbG93ZXJzIjpbXSwiZm9sbG93aW5nIjpbXSwicmVjb21tZW5kYXRpb24iOltdLCJ0b3RhbEVhcm4iOjAsInBhc3N3b3JkIjoiJDJhJDA4JGJCU1pQaWtPRVNGT3Z1TTF3UllXTWVId0thL3Z1NmFTVllUZXBqM2I1QlBSRzVpUGxqbnBhIiwiX192IjowfSwiaWF0IjoxNzE3MDQyNzIzfQ.kJ5Vqxg4EtcorXkHZ-lr_AbcL7NyGm8waWTPq37tswc"

    if (typeof bearerToken !== "undefined") {


      //console.log("token = ", bearerHeader)

      let jwtSecretKey = process.env.SECRET;
      
      jwt.verify(bearerToken, jwtSecretKey, (err, authData) => {
  
        if (err) {

            console.log("err = ", err)
            return null
    
        } else {
            console.log("verified - ", data)
            data = authData
    
        }
    
      });
  
    } else {
        data = null
    }

    console.log("end of jwt verify", bearerToken)

    return data
  
  };

module.exports = jwtVerify