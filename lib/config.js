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
  'stripe': {
     'auth':'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
  },
  'mailgun': {
     'account':'sandbox045f938519e245e39dcb423d1dd620d7.mailgun.org',
     'api': '0124d5789c295b910d146e56cb2bbb1c-52b6835e-ab01e386',
     'from': 'test@testing.com'
  }
}

// Production environment configuration
app.production = {
  'name': "production",
  'port': 5000,
  'secret': 'why_not_have_fun',
  'stripe': {
     'auth':'',
  },
  'mailgun': {
     'account':'',
     'api': '',
     'from':''
  }
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
