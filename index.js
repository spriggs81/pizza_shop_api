/*
*
*
*/

// Dependenices
const server = require('./lib/server');
const workers = require('./lib/workers')

// Creation of app object
const app = {};

// Initiation of application
app.init = ()=>{
  // Initiation of of Server
  server.init();

  // Initiation of Workers
  workers.init();
}

app.init();
