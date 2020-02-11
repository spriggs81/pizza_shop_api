/*
*
*
*/

// Dependenices
const _data = require('./data');
const _bot = require('./bots');
const config = require('./config');

// Creating lib object
const lib = {}

// USERS Route
lib.users = (data, cb)=>{
   const allowed = ['post','get','put','delete']
   if(allowed.indexOf(data.method) > -1){
      lib._users[data.method](data,cb)
   } else {
      cb(405,{"Error":"Please verify the method used!"});
   }
}

// Creating _users object
lib._users = {};

// User - post method
// Required dtata: firstName, lastName, email,street,city,state,zipcode,password
// Optional data: none
lib._users.post = (data,cb)=>{
   //store data if available or default
   const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email : false;
   const street = typeof(data.payload.street) == 'string' && data.payload.street.trim().length > 0 ? data.payload.street : false;
   const city = typeof(data.payload.city) == 'string' && data.payload.city.trim().length > 0 ? data.payload.city : false;
   const state = typeof(data.payload.state) == 'string' && data.payload.state.trim().length > 0 ? data.payload.state : false;
   const zipcode = typeof(data.payload.zipcode) == 'string' && data.payload.zipcode.trim().length > 0 ? data.payload.zipcode : false;
   const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   //check if requirements are met
   if(firstName&&lastName&&email&&street&&city&&state&&zipcode&&password){
      // hashng password
      const hashedPassword = _bot.hash(password);
      // tidy up new user data
      const newUserData = {
         'id': _bot.hash(email.toLowerCase().trim()),
         'firstName': firstName,
         'lastName': lastName,
         'email': email,
         'street': street,
         'city': city,
         'state': state,
         'zipcode': zipcode,
         'password': hashedPassword
      }
      // check is user already exist
      _data.read('users',newUserData.id,(err,data)=>{
         if(err){
            // Create the new user
            _data.create('users',newUserData.id,newUserData,(err)=>{
               if(!err){
                  cb(200)
               } else {
                  cb(500,err);
               }
            })
         } else {
            cb(400, {"Error": "Unable to add user, user may already exist!"});
         }
      })

   } else {
      cb(400,{"Error": "Missing Required Field(s)!"});
   }
}

// Users - get route
//Required Data: email
// Optional Data: none
lib._users.get = (data,cb)=>{
   // grab emal if available
   const email = typeof(data.queryString.email) == 'string' && data.queryString.email.trim().length > 0 ? data.queryString.email.trim() : false;
   // check if email is available
   if(email){
      // Read user data
      _data.read('users',_bot.hash(email.toLowerCase()),(err,data)=>{
         if(!err && data){
            delete data.password;
            cb(200,data);
         } else {
            cb(400, {"Error": "Unable to locate User!"});
         }
      });
   } else {
      cb(400,{"Error":"Missing required filed(s)!"})
   }
}

// Users - put route
// Required Data: email
// Optional Data: firstName, lastName, street, city, state, zipcode
lib._users.put = (data,cb)=>{
   //  Requred Data
   const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
   //Option Data
   const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   const street = typeof(data.payload.street) == 'string' && data.payload.street.trim().length > 0 ? data.payload.street.trim() : false;
   const city = typeof(data.payload.city) == 'string' && data.payload.city.trim().length > 0 ? data.payload.city.trim() : false;
   const state = typeof(data.payload.state) == 'string' && data.payload.state.trim().length > 0 ? data.payload.state.trim() : false;
   const zipcode = typeof(data.payload.zipcode) == 'string' && data.payload.zipcode.trim().length > 0 ? data.payload.zipcode : false;
   const newEmail = typeof(data.payload.newEmail) == 'string' && data.payload.newEmail.trim().length > 0 ? data.payload.newEmail.trim() : false;
   // check if reqiured and one optional data optins are available
   if(email&&(firstName||lastName||street||city||state||zipcode)){
      // Look up account
      _data.read('users',_bot.hash(email.toLowerCase()),(err,userData)=>{
          oldEmail = false;
         if(!err && userData){
            // Update the fields where data is provded
            if(firstName){
               userData.firstName = firstName;
            }
            if(lastName){
               userData.lastName = lastName;
            }
            if(street){
               userData.street = street;
            }
            if(city){
               userData.city = city;
            }
            if(state){
               userData.state = state;
            }
            if(zipcode){
               userData.zipcode = zipcode;
            }
            if(newEmail){
               oldEmail = userData.email;
               userData.email = newEmail;
            }
            // If email doesn't change then update existing
            if(!oldEmail){
               // Update the user's data
               _data.update('users',_bot.hash(email.toLowerCase()),userData,(err)=>{
                  if(!err){
                     cb(200,{"Success":"User has been updated!"})
                  } else {
                     cb(500,err);
                  }
               })
            } else {
               // If email changes then create a new account with email hash
               _data.create('users',_bot.hash(email.toLowerCase()),userData,(err)=>{
                  if(!err){
                     // Delete the old account with old email hash.
                     _data.delete('users',_bot.hash(oldEmail.toLowerCase()),(err)=>{
                        if(!err){
                           cb(200,{"Success":"User has been updated!"});
                        } else {
                           cb(500,{"Error":"Problem deleting old account email!"});
                        }
                     });
                  } else {
                     cb(500,{"Error":err});
                  }
               })
            }
         } else {
            cb(400,{"Error":"Unable to locate account!"});
         }
      })
   } else {
      cb(400,{"Error":"Missing required data"});
   }
}

// User - delete route
// Required Data: email
// Optional Data:
lib._users.delete = (data,cb)=>{
   // Check email reuirements
   const email = typeof(data.queryString.email) == 'string' && data.queryString.email.trim().length > 0 ? data.queryString.email.trim() : false;
   // Error if email isn't valid
   if(email){;
      // Check if account exist
      _data.read('users',_bot.hash(email.toLowerCase()),(err,data)=>{
         if(!err && data){
            // Delete the user's account
            _data.delete('users',id,(err)=>{
               if(!err){
                  cb(200, {"Success":"User has been deleted!"});
               } else {
                  cb(500,{"Error":"Unable to delete user!"});
               }
            });
         } else {
            cb(500,{"Error":"Unable to locate an account!"});
         }
      });
   } else {
      cb(400,{"Error":"Missing reqiured field!"});
   }
}


// TOKENS Route
lib.tokens = (data, cb)=>{
   const allowed = ['post','get','put','delete']
   if(allowed.indexOf(data.method) > -1){
      lib._tokens[data.method](data,cb);
   } else {
      cb(405,{"Error":"Please verify Method used!"});
   }
}

// creating the _tokens object
lib._tokens = {};

// Token - post route
// Required Data: email and password
// Optional Data: none
lib._tokens.post = (data,cb)=>{
   // check if requirements are met or default;
   const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
   const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   // verify if email ans password was sent
   if(email && password){
      // Checks for user
      _data.read('users',_bot.hash(email.toLowerCase()),(err,userData)=>{
         if(!err && userData){
            // hash the sent password
            const hashedPassword = _bot.hash(password);
            // Checks sent password against stored password
            if(userData.password == hashedPassword){
               // Create random id
               const id = _bot.toCode(25);
               // Create expired time in the future by 1 hour
               const expires = Date.now() + 1000 * 60 * 60;
               // Create the token data object
               const tokenData = {
                  "email": userData.email,
                  "id": id,
                  "expires": expires
               }
               // Save token data to file
               _data.create('tokens',id,tokenData,(err)=>{
                  if(!err){
                     cb(200, tokenData);
                  } else {
                     cb(500,{"Error": "Unable to create token"});
                  }
               });
            } else {
               cb(401);
            }
         } else {
            cb(400,{"Error":"Unable to find account!"});
         }
      });
   } else {
      cb(400,{"Error":"Missing required fields!"});
   }
}

// Tokens - get route
// Required Data: token
// Optional Data: none
lib._tokens.get = (data,cb)=>{
   // Grab id if available
   const token = typeof(data.queryString.token) == 'string' && data.queryString.token.trim().length == 25 ? data.queryString.token.trim() : false;
   // Verify if tokenId is valid
   if(token){
      _data.read('tokens',token,(err,tokenData)=>{
         if(!err && tokenData){
            cb(200,tokenData);
         } else {
            cb(400,{"Error":"Unable to locate token information!"});
         }
      });
   } else {
      cb(400,{"Error":"Missing required data!"});
   }
}

// Tokens - put route
// Required Data: token
// Optional Data; none
lib._tokens.put = (data,cb)=>{
   // Grab id if available
   const token = typeof(data.payload.token) == 'string' && data.payload.token.trim().length == 25 ? data.payload.token.trim() : false;
   // Check if id is valid
   if(token){
      // Check for token data
      _data.read('tokens',token,(err,tokenData)=>{
         if(!err && tokenData){
            // Check if token is expired if not add 60 mins
            if(tokenData.expires > Date.now()){
               tokenData.expires = Date.now() + 1000 * 60 * 60;
               // Save updated token info
               _data.update('tokens',token,tokenData,(err)=>{
                  if(!err){
                     cb(200,{"Success":"Token data has been updated!"});
                  } else {
                     cb(500,{"Error":"Unable to update token data!"});
                  }
               })
            } else {
               cb(401,{"Error":"This token has already expired!"});
            }
         } else {
            cb(401,{"Error":"Unable to locate token!"});
         }
      })
   } else {
      cb(400,{"Error":"Missing/Invalid required fields!"});
   }
}

// Tokens - delete route
// Required Data: token
// Optiomal Data: none
lib._tokens.delete = (data,cb)=>{
   // Grab ID if available
   const token = typeof(data.queryString.token) == 'string' && data.queryString.token.trim().length == 25 ? data.queryString.token.trim() : false;
   // Check if tokenId is valid
   if(token){
      // Lookup the token id
      _data.read('tokens',token,(err,tokenData)=>{
         if(!err && tokenData){
            // Delete the token
            _data.delete('tokens',token,(err)=>{
               if(!err){
                  cb(200,{"Success":"Token has been deleted!"});
               } else {
                  cb(500,{"Error":"Unable to delete token!"});
               }
            })
         } else {
            cb(400,{"Error":"Unable to locate token!"});
         }
      })
   } else {
      cb(400,{"Error":"Missing/Invalid required field"});
   }
}

// Checks if token is valid
lib._tokens.checkToken = (id, cb)=>{
   _data.read('tokens',id,(err,data)=>{
      if(!err && data){
         if(data.expires > Date.now()){
            cb(false,data);
         } else {
            cb(true,{"Error":"Token is expired!"})
         }
      } else {
         cb(true,{"Error":"Cannot find token!"});
      }
   })
}

lib.orders = (data,cb)=>{
   const allowed = ['post','get','put','delete'];
   if(allowed.indexOf(data.method) > -1){
      lib._orders[data.method](data,cb);
   } else {
      cb(405,{"Error":"Please verify the correct method!"})
   }
}

// Create _orders object
lib._orders = {};

// Orders - post route
// Required data: size, dough, meat or non-meat toppings
// Optional data: meat or non-meat
lib._orders.post = (data,cb)=>{
   // Grab token Id from headers and verify in correct format
   const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
   if(token){
      // Check token and return token data if valid
      lib._tokens.checkToken(token,(err,tokenData)=>{
         if(!err && tokenData){
            // Grab user data
            _data.read('users',_bot.hash(tokenData.email.toLowerCase()),(err,userData)=>{
               if(!err && userData){
                  // Check if orders exist else create empty array
                  console.log("1st: ",typeof(userData.orders) == 'object');
                  console.log("2nd: ",userData.orders instanceof Array);
                  const orders = typeof(userData.orders) == 'object' && userData.orders instanceof Array ? userData.orders : [];
                  console.log("Orders: ",orders);
                  // Check payload to verify required data
                  const size = typeof(data.payload.size) == 'string' && _bot.checkSize(data.payload.size) == true ? data.payload.size.trim() : false;
                  const dough = typeof(data.payload.dough) == 'string' && _bot.checkDough(data.payload.dough) == true ? data.payload.dough.trim() : false;
                  const meat = Array.isArray(data.payload.meat) == true && _bot.checkMeat(data.payload.meat) == true? data.payload.meat : [];
                  const nonMeat = Array.isArray(data.payload.nonMeat) == true && _bot.checkNonMeat(data.payload.nonMeat) == true ? data.payload.nonMeat : [];
                  if(size && dough && (meat || nonMeat)){
                     const orderId = _bot.toCode(30);
                     const clientOrder = {
                        date: Date.now(),
                        email: userData.email,
                        id: orderId,
                        size: size,
                        dough: dough,
                        meat: meat,
                        nonMeat: nonMeat
                     }
                     _data.create('orders',orderId,clientOrder,(err)=>{
                        if(!err){
                           orders.push(orderId);
                           userData.orders = orders;
                           _data.update('users',userData.id,userData,(err)=>{
                              if(!err){
                                 cb(200,clientOrder);
                              } else {
                                 cb(500,{"Error":"Error saving order to user's account!"});
                              }
                           });
                        } else {
                           cb(500,{"Error":"Problem saving order!"});
                        }
                     });
                  } else {
                     cb(400,{"Error":"Missing required fields!"});
                  }
               } else {
                  console.log("error: ",err," / data: ",userData);
                  cb(400,{"Error":"Unable to locate Account"});
               }
            })
         } else {
            cb(401);
         }
      })
   } else {
      cb(401,{"Error":"Invalid Token!"});
   }
}

// Orders - get route
// Required Data: orderId
// Optional Data: none
lib._orders.get =(data,cb)=>{
   // grab token from hearder and verify format
   const token = typeof(data.headers.token) =='string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
   if(token){
      // Verify token is valid
      lib._tokens.checkToken(token,(err,tokenData)=>{
         if(!err && tokenData){
            // Grab order id from query string
            const orderId = typeof(data.queryString.orderId) == 'string' && data.queryString.orderId.trim().length == 30 ? data.queryString.orderId.trim() : false;
            if(orderId){
               // Grab order infomation from file
               _data.read('orders',orderId,(err,orderData)=>{
                  if(!err && orderData){
                     // Verify order data belongs to requester and server data
                     if(tokenData.email == orderData.email){
                        cb(200,orderData);
                     } else {
                        cb(401,{"Error":"Unable to process request!"});
                     }
                  } else {
                     cb(400,{"Error":"Unanle to find order infomation!"})
                  }
               });
            } else {
               cb(400,{"Error":"Invalid Order ID!"});
            }
         } else {
            cb(400, {"Error":"Token not found or no longer valid!"});
         }
      });
   } else {
      cb(401,{"Error":"Invalid Token!"});
   }
}

// Menu route
lib.menu = (data,cb)=>{
   if(data.method == 'get'){
      lib._menu[data.method](data,cb);
   } else {
      cb(405,{"Error":"Please verify the correct method!"})
   }
}

// create _menu object
lib._menu = {};

// Menu - get route
// Requirements: id
lib._menu.get = (data,cb)=>{
   const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
   if(token){
      const validToken = lib._tokens.checkToken(token);
      if(validToken){
         const menu = config.pizzaMenu;
         cb(false,menu);
      } else {
         console.log(validToken);
         cb(400,{"Error":"Token is not valid!"});
      }
   }
}

// Default if route isn't found
lib.notFound = (data, cb)=>{
   cb(404)
}


// Exporting module
module.exports = lib;
