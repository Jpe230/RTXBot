require("dotenv").config();

const scrapper = require("./scrapper/scrapper.js");

let desiredProducts = scrapper.products;

async function scrap (product, store) {
  scrapper.scrap(product, store);
}

Object.entries(desiredProducts).forEach(
  //Looping through products
  ([key, value]) => {
    let product = key;
    let stores  = value.stores;
    console.log(stores);
    stores.forEach(function (store, index) {
      console.log("Scanning for available: " + product  + " in store: " + store.name);
      scrap(product, store);
    });
  }
);

