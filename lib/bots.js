/*
*
*
*/

// Dependenices
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const config = require('./config');

// Creates lib object
const lib = {};

// hashes a string
lib.hash = (str)=>{
   if(typeof(str) == 'string' && str.length > 0){
      const hash = crypto.createHmac('sha256',config.secret).update(str).digest('hex');
      return hash;
   }
    else {
      return false
   }
}

// Parse JSOM string without throwing
lib.parsejson = (str)=>{
   try{
      let obj = JSON.parse(str);
      return obj;
   } catch(e){
      return {};
   }
}

// Provides a number of random charcters
lib.toCode = (num)=>{
   if(typeof(num) == 'number' && num > 0){
      const dataSource = '1234567890qwertyuiopasdfghjklzxcvbnm';
      let str = ''
      for(i = 1; i <= num; i++){
         const random = dataSource.charAt(Math.floor(Math.random() * dataSource.length));
         str+=random;
      }
      return str;
   } else {
      return false
   }
}


// Stripe Charge Payment API (https://stripe.com/docs/api/charges/create?lang=dotnet)
// required data: amount(number),currency(string)
// optional data: source(string),description(string)
lib.stripeCharge = (chargeObject,cb)=>{
   // stringify chargeObject
   const stringPayload = querystring.stringify(chargeObject)
   // create details for the requet
   const requestDetails = {
      protocol: 'https:',
      hostname: 'api.stripe.com',
      method: 'POST',
      path: '/v1/charges',
      auth: config.stripe.auth,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
   }
   // create the request object
   const req = https.request(requestDetails,(res)=>{
      // Create array to hold any data
      const chunks = [];
      // collect any data provided
      res.on("data", function (chunk) {
         chunks.push(chunk);
      });
      // On end provided any received data
      res.on("end", function (chunk) {
         const body = Buffer.concat(chunks);
         const status = res.statusCode;
         if(status == 200){
            cb(false,JSON.parse(body));
         } else {
            cb(status,JSON.parse(body));
         }
       });

   });
   // Bind to the err event so it doesn't get thrown
   req.on('Error',(e)=>{
      cb(e);
   });

   req.write(stringPayload);

   req.end()
}

// MailGun API (https://documentation.mailgun.com/en/latest/faqs.html#faq);
// required data: to(string),from(string),text(string);
// optional data: subject(string);
lib.mailgunMailer = (emailObject,cb)=>{
   // create payload
   const payload = {
      "from": config.mailgun.from,
      "to": emailObject.to,
      "subject": emailObject.subject,
      "text": emailObject.text
   }
   // stringify the payload
   const stringPayload = querystring.stringify(payload);
   // create details for the request
   const requestDetails = {
      protocol: 'https:',
      hostname: 'api.mailgun.net',
      method: 'POST',
      path: '/v3/'+config.mailgun.account+'/messages',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic '+Buffer.from('api:'+config.mailgun.api).toString('base64'),
        'Content-Length': Buffer.byteLength(stringPayload)
      }
   }

   // create the request object
   const req = https.request(requestDetails,(res)=>{
      // create array to hold returned data
      const chunks = [];
      // Collect provided data
      res.on("data", function (chunk) {
         chunks.push(chunk);
      });
      // On end provide is any
      res.on("end", function (chunk) {
         const body = Buffer.concat(chunks);
         const status = res.statusCode;
         if(status == 200){
            cb(false,JSON.parse(body));
         } else {
            cb(status,JSON.parse(body));
         }
       });

   });
   // Bind to err event so it doesn't get thrown
   req.on('Error',(e)=>{
      cb(e);
   });

   req.write(stringPayload);

   req.end()
}

module.exports = lib;
