/*
*
*
*/

// Dependenices

// Creation of app object
const app = {};

// Stagging environment configuration
app.stagging = {
  'name': "stagging",
  'port': 3000,
  'secret': 'happy_happy_joy_joy',
  'super': 'superUser',
  'repus': 'password2'
}

// Production environment configuration
app.production = {
  'name': "production",
  'port': 5000,
  'secret': 'why_not_have_fun',
  'super': 'superUser',
  'repus': 'password2'
}

// Configures app's environment based on process.env.NODE_ENV
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Environment's configuration passed to application when launched
const exportedEnv = typeof(app[currentEnv]) == 'object' ? app[currentEnv] : app.stagging;

exportedEnv.pizzaMenu = {
   'size': ['peronal','small','medium','large','xLarge'],
   'dough':['hand toss','pan','thin crust','stuffed crust'],
   'meat':['sausage','pepperoni','chicken','pastrami','italian salami','bacon','ham'],
   'nonMeat':['onions','tomatoes','mushrooms','green peppers','cheddar cheese','corn','red peppers','pineapples','artichoke','avocado','spinach']
}

// Exporting module
module.exports = exportedEnv;
