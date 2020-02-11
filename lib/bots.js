/*
*
*
*/

// Dependenices
const crypto = require('crypto');
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

// Check submitted size to menu sizes
lib.checkSize = (size)=>{
   let good = false;
   if(size.length > 0){
      const obj = config.pizzaMenu.size;
      if(obj.indexOf(size) > -1){
         good = true;
      }
   }
   console.log("size: ",good);
   return good;
}

// Check submiited dough zaz
lib.checkDough = (dough)=>{
   let good = false;
   if(dough.length > 0){
      const obj = config.pizzaMenu.dough;
      if(obj.indexOf(dough) > -1){
         good = true;
      }
   }
   console.log("dough: ",good);
   return good;
}

// Check submitted meat topping to menu meat toppings
lib.checkMeat = (meat)=>{
   let good = false;
   if(meat.length > 0){
      const obj = config.pizzaMenu.meat;
      meat.forEach((item)=>{
         if(obj.indexOf(item) > -1){
            good = true;
         } else {
            good = false
            return;
         }
      });
   }
   console.log("meat: ",good);
   return good;
}

// CHeck submitted non-meat toppings to menu non-meat toppings
lib.checkNonMeat = (nonMeat)=>{
   let good = false;
   if(nonMeat.length > 0){
      const obj = config.pizzaMenu.nonMeat;
      nonMeat.forEach((item)=>{
         if(obj.indexOf(item) > -1){
            good = true;
         } else {
            good = false;
            return;
         }
      });
   }
   console.log("nonMeat: ",good);
   return good;
}

module.exports = lib;
