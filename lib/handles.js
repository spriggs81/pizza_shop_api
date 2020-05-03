/*
* Handles - This page handles routing
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
         'id': email.toLowerCase(),
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
      // grab the token id and verify the format
      const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
      lib._tokens.checkToken(tokenId, email, (verifiedToken)=>{
         if(verifiedToken){
            // Read user data
            _data.read('users',email.toLowerCase(),(err,data)=>{
               if(!err && data){
                  delete data.password;
                  cb(200,data);
               } else {
                  cb(400, {"Error": "Unable to locate User!"});
               }
            });
         } else {
            cb(401,{"Error":"Missing or Invalid token information!"})
         }
      })
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
      // grab token and Verify
      const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
      lib._tokens.checkToken(token,email,(verifiedToken)=>{
         if(verifiedToken){
            // Look up account
            _data.read('users',email.toLowerCase(),(err,userData)=>{
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
                     _data.update('users',email.toLowerCase(),userData,(err)=>{
                        if(!err){
                           cb(200,{"Success":"User has been updated!"})
                        } else {
                           cb(500,err);
                        }
                     })
                  } else {
                     // If email changes then create a new account with email hash
                     _data.create('users',email.toLowerCase(),userData,(err)=>{
                        if(!err){
                           // Delete the old account with old email hash.
                           _data.delete('users',oldEmail.toLowerCase(),(err)=>{
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
            cb(401,{"Error":"Missing or Invalid token information"})
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
   if(email){
      // grab token and verify
      const tokenId = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
      lib._tokens.checkToken(tokenId,email,(verifiedToken)=>{
         if(verifiedToken){
            // Check if account exist
            _data.read('users',email.toLowerCase(),(err,data)=>{
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
            cb(401,{"Error":"Missing or Invalid token information"})
         }
      })
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
      _data.read('users',email.toLowerCase(),(err,userData)=>{
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
lib._tokens.checkToken = (id,email,cb)=>{
   _data.read('tokens',id,(err,tokenData)=>{
      if(!err && tokenData){
         if(tokenData.email == email && tokenData.expires > Date.now()){
            cb(true);
         } else {
            cb(false)
         }
      } else {
         cb(false);
      }
   })
}

lib.orders = (data,cb)=>{
   const allowed = 'post';
   if(data.method == allowed){
      lib._orders[data.method](data,cb);
   } else {
      cb(405,{"Error":"Please verify the correct method!"})
   }
}

// Create _orders object
lib._orders = {};

// Orders - post route
// Required data: email, item(when sending multiple items use an array and repeat item# 'e.g.: ["item1","item1","item3"]')
// Optional data: none
lib._orders.post = (data,cb)=>{
   //grab email and verify information
   const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
   // grab token and verify informtion
   const tokenId =  typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
   lib._tokens.checkToken(tokenId,email,(verifiedToken)=>{
      if(verifiedToken){
         // verify order is valid
         lib._orders.checkingItem(data.payload.item,(err,orderData)=>{
            if(!err && orderData){
               // create stripe payload
               const stripePayload = {
                  "currency": "USD",
                  "amount": orderData.price * 100,
                  "source": "tok_mastercard"
               }
               // send stripe payload to stripe for charge
               _bot.stripeCharge(stripePayload,(err,paymentData)=>{
                  if(!err && paymentData){
                     // grab user information
                     _data.read('users',email,(err,userData)=>{
                        if(!err && userData){
                           // add transaction id to order array
                           if(!userData.orders){
                              userData.orders = [];
                           }
                           userData.orders.push(paymentData.id);
                           // update existing user data with new order id
                           _data.update('users',email,userData,(err)=>{
                              if(!err){
                                 // Add description information to data
                                 paymentData.pizzaDesc = orderData.desc;
                                 // create order and save transaction
                                 _data.create('orders',paymentData.id,paymentData,(err)=>{
                                    const body = "Hello "+userData.firstName+" "+userData.lastName+"\n\n"+"Thank you for your order.  This email is to confirm that your order of "+orderData.desc.toString()+".\n"+"Charge Amount: "+orderData.price+"\n"+"Charge Status: "+paymentData.status
                                    if(!err && paymentData){
                                       const emailObject = {
                                          'to': email,
                                          "subject": "Payment Receipt!",
                                          "text": body
                                       }
                                       // email confirmation to user
                                       _bot.mailgunMailer(emailObject,(err,data)=>{
                                          if(!err && data){
                                             cb(200,data);
                                          } else {
                                             cb(err,data);
                                          }
                                       });
                                    } else {
                                       cb(500,err);
                                    }
                                 })
                              } else {
                                 cb(500,err);
                              }
                           });
                        } else {
                           cb(500,err);
                        }
                     });
                  } else {
                      cb(err,paymentData);
                  }
               });
            } else {
               cb(400,{"Error":"Missing/Invalid required information"});
            }
         });
      } else {
         cb(401,{"Error":"Missing or Invalid token information"});
      }
   });
}

lib._orders.checkingItem = (item,cb)=>{
   const order = {};
   if(Array.isArray(item) == true){
      order.desc = [];
      order.price = 0;
      for(clientItem of item){
         for(menuItem of _data.pizzaMenu){
            if(menuItem.item == clientItem){
               order.desc.push(menuItem.name);
               order.price += menuItem.price;
            }
         }
      }
   } else {
      for(items of _data.pizzaMenu){
         if(items.item == item){
            order.desc = items.name,
            order.price = items.price
         }
      }
   }
   cb(false,order)
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
// Required Data: email
// Optional Data: none
lib._menu.get = (data,cb)=>{
   // grab email and verify format
   const email = typeof(data.queryString.email) == 'string' && data.queryString.email.trim().length > 0 ? data.queryString.email.trim() : false;
   if(email){
      // grab token and verify token
      const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 25 ? data.headers.token.trim() : false;
      lib._tokens.checkToken(token,email,(verifiedToken)=>{
         if(verifiedToken){
            cb(200,_data.pizzaMenu);
         } else {
            cb(401,{"Error":"Missing or Invalid token infomation"})
         }
      })
   } else {
      cb(400,{"Error":"Missing/Invalid required information!"})
   }
}

// Default if route isn't found
lib.notFound = (data, cb)=>{
   cb(404)
}


// Exporting module
module.exports = lib;
