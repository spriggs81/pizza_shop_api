/*
*
*
*/

// Dependenices
const _bot = require('./bots');
const _data = require('./data');

// Create lib object
const lib = {};

// Deletes old or invalid tokens automatically
lib.deleteOldTokens = ()=>{
   _data.list('tokens',(err,data)=>{
      if(!err,data){
         const allTokens = Array.isArray(data) == true && data.length > 0 ? data : false;
         if(allTokens){
            allTokens.forEach((token)=>{
               _data.read('tokens',token,(err,tokenData)=>{
                  //tokenData = JSON.parse(tokenData);
                  if(!err && tokenData){
                     if(tokenData.expires < Date.now()){
                        _data.delete('tokens',token,(err)=>{
                           if(!err){
                              console.log("bye bye old token!");
                           } else {
                              console.log(err);
                           }
                        });
                     } else if(!tokenData.expires){
                        _data.delete('tokens',token,(err)=>{
                           if(!err){
                              console.log(tokenData.expires);
                              console.log("Bye Bye Token with no expires!");
                           } else {
                              console.log("Unable to delete bad token!");
                           }
                        })
                     }
                  } else if(err == null){
                     _data.delete('tokens',token,(err)=>{
                        if(!err){
                           console.log("Bye Bye Bad Token");
                        } else {
                           console.log("Unable to delete bad token!");
                        }
                     })
                  } else{
                     console.log(err);
                  }
               });
            });
         } else {
            // left blank as the system has nothing to do.
         }
      } else {
         // left blank as the system has nothing to do.
      }
   });
}

lib.checkByMinute = ()=>{
   console.log("By Mintues started!");
   setInterval(()=>{
      lib.deleteOldTokens();
   },6000);
}

lib.init = ()=>{
   console.log("INIT Started");
   lib.checkByMinute();
}

module.exports = lib;
