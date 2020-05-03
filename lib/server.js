/*
*
*
*/

// Dependenices
const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const handles = require('./handles');
const _bot = require('./bots');

// Creation of server object
const server = {};

//
server.httpServer = http.createServer((req,res)=>{
     server.pizzaServer(req,res);
});

//
server.pizzaServer = (req,res)=>{
     // Get parse URL object
     const parsedUrl = url.parse(req.url,true);

     // Get trimmed path string
     const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g,'');

     // Get parse query string
     const parsedQuery = parsedUrl.query;

     // Get method (CRED)
     const method = req.method.toLowerCase();

     // Get headers
     const headers = req.headers;

     // Get Payload, if any
     let decorder = new StringDecoder('utf-8');
     let buffer = '';
     req.on('data',(data)=>{
          buffer += decorder.write(data);
     });
     req.on('end',()=>{
          buffer += decorder.end();

          // Choose handle to send
          const choosenHandle = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handles.notFound;

          // Creates the data object to pass to handles
          const data = {
               "headers": headers,
               "method": method,
               "trimmedPath": trimmedPath,
               "queryString": parsedQuery,
               "payload": _bot.parsejson(buffer)
          }
          // route the request to the handle of choice
          choosenHandle(data,(statusCode,payload)=>{
             // if statusCode then send statusCode or default to 200
             statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

             // if payload send payload or default to empty object
             payload = typeof(payload) == 'object' ? payload : {};

             // convert payload into a string
             let stringPayload = JSON.stringify(payload);

            // return the repsonse
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(stringPayload);

          })
     });
}

server.router = {
   'users': handles.users,
   'tokens': handles.tokens,
   'menu': handles.menu,
   'orders': handles.orders
}

// Initiation of Serser
server.init = ()=>{
     // Starting server and listening on provided port
     server.httpServer.listen(config.port,()=>{
          console.log('Application Started and listening on Port: ',config.port);
     });
}

// Exporting module
module.exports = server;
