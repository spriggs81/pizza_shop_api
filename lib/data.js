/*
*
*
*/

// Dependenices
const fs = require('fs');
const path = require('path');
const _bot = require('./bots');

// Create lib object
const lib = {};

// Creates the based directory for data storage
lib.basedDir = path.join(__dirname,'/../.data/');

// Creates a JSON file to it's folder
lib.create = (dir,file,data,cb)=>{
     fs.open(lib.basedDir+dir+'/'+file+'.json','wx',(err,fd)=>{
          if(!err && fd){
               // converting data into a string
               const stringData = JSON.stringify(data);
               fs.writeFile(fd,stringData,(err)=>{
                    if(!err){
                         fs.close(fd,(err)=>{
                              if(!err){
                                   cb(false);
                              } else {
                                   cb('Error while trying to close file!');
                              }
                         });
                    } else {
                         cb('Error while trying to write to file!');
                    }
               });
          } else {
               cb('Could not create a new file, it already exist');
          }
     });
}

// Read the data from a folder
lib.read = (dir,file,cb)=>{
     fs.readFile(lib.basedDir+dir+'/'+file+'.json','utf-8',(err,data)=>{
          if(!err && data){
               // Convert string data to json
               const parsedData = JSON.parse(data);
               cb(false,parsedData);
          } else {
               cb(err,data);
          }
     });
}

// Update the data from a folder
lib.update = (dir,file,data,cb)=>{
   fs.open(lib.basedDir+dir+'/'+file+'.json','r+',(err,fd)=>{
      if(!err && fd){
         // Convert data into a string
         const stringData = JSON.stringify(data);
         fs.ftruncate(fd,(err)=>{
            if(!err){
               fs.writeFile(fd,stringData,(err)=>{
                  if(!err){
                     fs.close(fd,(err)=>{
                        if(!err){
                           cb(false);
                        } else {
                           cb('Error trying to close file');
                        }
                     });
                  } else {
                     cb('Error writing to file!');
                  }
               });
            } else {
               cb('Error truncating file!');
            }
         });
      } else {
         cb("Error could not open file for update, verify if it exist!");
      }
   });
}

// delete a file in a folder
lib.delete = (dir,file,cb)=>{
   fs.unlink(lib.basedDir+dir+'/'+file+'.json',(err)=>{
      if(!err){
         cb(false);
      } else {
         cb('Error deleting the file: ',err);
      }
   });
}

// List all files in folder
lib.list = (dir,cb)=>{
   fs.readdir(lib.basedDir+dir+'/',(err,data)=>{
      if(!err && data){
         const correctedNames = [];
         data.forEach((fileName)=>{
            correctedNames.push(fileName.replace('.json',''));
         });
         cb(false,correctedNames);
      } else {
         cb(err,data);
      }
   })
}

// Menu for pizzas
lib.pizzaMenu = [
   {"item":"item1","name":"Pepperoni Pizza","price":19.95},
   {"item":"item2","name":"Combo Pizza","price":22.95},
   {"item":"item3","name":"Cheese Pizza","price":15.95},
   {"item":"item4","name":"All Meat Pizza","price":25.95}
]

module.exports = lib;
