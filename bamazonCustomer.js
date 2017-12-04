/*
# Node.js & MySQL
## Overview
In this activity, you'll be creating an Amazon-like storefront with the MySQL skills you learned this week. The app will take in orders from customers and deplete stock from the store's inventory. As a bonus task, you can program your app to track product sales across your store's departments and then provide a summary of the highest-grossing departments in the store.
Make sure you save and require the MySQL and Inquirer npm packages in your homework files--your app will need them for data input and storage.
## Submission Guide
Make sure you use the normal GitHub. Because this is a CLI App, there will be no need to deploy it to Heroku. This time, though, you need to include screenshots, a gif, and/or a video showing us that you got the app working with no bugs. You can include these screenshots or a link to a video in a `README.md` file.
* Include screenshots (or a video) of typical user flows through your application (for the customer and if relevant the manager/supervisor). This includes views of the prompts and the responses after their selection (for the different selection options).
* Include any other screenshots you deem necessary to help someone who has never been introduced to your application understand the purpose and function of it. This is how you will communicate to potential employers/other developers in the future what you built and why, and to show how it works. 
* Because screenshots (and well-written READMEs) are extremely important in the context of GitHub, this will be part of the grading.
If you haven't written a markdown file yet, [click here for a rundown](https://guides.github.com/features/mastering-markdown/), or just take a look at the raw file of these instructions.
## Instructions
### Challenge #1: Customer View (Minimum Requirement)
1. Create a MySQL Database called `bamazon`.
2. Then create a Table inside of that database called `products`.
3. The products table should have each of the following columns:
   * item_id (unique id for each product)
   * product_name (Name of product)
   * department_name
   * price (cost to customer)
   * stock_quantity (how much of the product is available in stores)
4. Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).
5. Then create a Node application called `bamazonCustomer.js`. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
6. The app should then prompt users with two messages.
   * The first should ask them the ID of the product they would like to buy.
   * The second message should ask how many units of the product they would like to buy.
7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
   * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
   * This means updating the SQL database to reflect the remaining quantity.
   * Once the update goes through, show the customer the total cost of their purchase.
- - -
* If this activity took you between 8-10 hours, then you've put enough time into this assignment. Feel free to stop here -- unless you want to take on the next challenge.
- - -
*/

let inquirer = require("inquirer");
let mysql = require("mysql");
let myList = [];
let totalQuantity = 0;
let prodName = "";
let myCost = 0;
let selectedID;

let connection = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: process.env.MYSQL_ROOT_PASSWORD,
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

            connection.query("SELECT stock_quantity, price, item_id FROM products WHERE ?",{product_name: answers.amazonProd}, (err, res) => {
               if (err) throw err;
               // console.log("\n"+res);
               // console.log("stock_quantity",res[0].stock_quantity);
               selectedID = res[0].item_id;
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
         var newQuant = totalQuantity - answers.quantity;
         resolve("Entered Quantity: " + answers.quantity + "\nUnit Price: " + myCost + "\nTotal Price: " + answers.quantity * myCost);
         connection.query("UPDATE products SET stock_quantity = "+newQuant+" WHERE item_id = " + selectedID, (err, res) => {
            if(err) throw err;
            return console.log("Remaining Quantity: " + newQuant);
         });
      });
   });
};

getProd().then((res) => {

}).catch((err) => {
   console.log(err);
});
