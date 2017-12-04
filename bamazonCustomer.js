let inquirer = require("inquirer");
let mysql = require("mysql");
let myList = [];
let totalQuantity = 0;
let prodName = "";
let myCost = 0;

let connection = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: process.env.MYSQL_ROOT_PASSWORD, // <--Personal password stored as an environment variable on my computer; Use your password
   database: "bamazon"
});

connection.connect();

let getProd = () => {
   return new Promise((resolve, reject) => {
      var myQuery = "SELECT * FROM products";
      connection.query(myQuery, (err, res) => {
         if(err) return reject(err);
         for(key in res) {
            console.log(res[key].item_id+"\t"+res[key].product_name+"\t"+res[key].price);
            myList.push(res[key].product_name);
         };

         inquirer.prompt([
            {
               type:"rawlist",
               name:"amazonProd",
               message:"Please Enter the ID to which product you want",
               choices: myList
            }
         ]).then(answers =>{
            // console.log("\n"+answers.amazonProd);

            connection.query("SELECT stock_quantity, price FROM products WHERE ?",{product_name: answers.amazonProd}, (err, res) => {
               if (err) throw err;
               // console.log("\n"+res);
               // console.log("stock_quantity",res[0].stock_quantity);
               totalQuantity = res[0].stock_quantity;
               myCost = res[0].price;
            });
            quantityCatch().then((res) => {
               console.log(res);
            }).catch((err) => {
               console.log(err);
            });
         });  

         return resolve(res);
      });
   });
};

let getID = () => {
   return new Promise((resolve, reject) => {
      connection.query("SELECT item_id FROM products", (err, res) =>{
         if(err) return reject(err);
         return resolve(res);
      });
   });
};

let quantityCatch = () => {
   return new Promise((resolve, reject) => {
      inquirer.prompt([
         {
            type: "input",
            name: "quantity",
            message: "Please Enter the quantity of the product",
            validate: (quantity) =>{
               
               switch(true){
                  case parseInt(quantity) > parseInt(totalQuantity):
                     return "Exceeds the total amount"; 
                  case isNaN(quantity):
                     return "Enter a number";
                  default:
                     return true;
               };
            }
         }
      ]).then(answers => {
         resolve("Entered Quantity: " + answers.quantity + "\nUnit Price: " + myCost + "\nTotal Price: " + answers.quantity * myCost);
      });
   });
};

getProd().then((res) => {

}).catch((err) => {
   console.log(err);
});
