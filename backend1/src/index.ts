// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";


// // Recreate __filename and __dirname
// const __filename = fileURLToPath(import.meta.url);
// console.log('__filename :>> ', __filename);

// const __dirname = path.dirname(__filename);

// console.log('__dirname :>> ', __dirname);
// const filePath = path.join(__dirname, "data");

// if (!fs.existsSync(filePath)) {
//     fs.mkdirSync(filePath)
// }
// const newfilePath = path.join(filePath, "example.txt")

// // sync way of creating the file

// fs.writeFileSync(newfilePath, "hey this is file by me ")

// fs.appendFileSync(newfilePath, "\nthis is new this added")
// const readContentFromFile = fs.readFileSync(newfilePath, "utf8")


// console.log('readContentFromFile :>> ', readContentFromFile);

// import http from "http"

// const server = http.createServer((req, res) => { })

// server.listen(3000, () => {

// })


// import EventEmitter from "events"

// class MyCustomEmitter extends EventEmitter {
//     greeting;
//     constructor() {
//         super();
//         this.greeting = "Hellow"
//     }
//     greet(name: string) {
//         this.emit('greeting', `${this.greeting},${name}`)
//     }
// }

// const myCustomEmitter = new MyCustomEmitter()

// myCustomEmitter.on('greeting', (input) => {
//     console.log('greeting input :>> ', input);
// })


// myCustomEmitter.greet("Usman")

// http
// callback and callbackhell
// promises
// async await
// event emitter
// path
// fs (file system)



// Expressjs

import express from "express";
import path from "path";

const app = express();

app.set('view engine', 'ejs');

// Using the built-in import.meta.dirname
const __dirname = import.meta.dirname;

app.set("views", path.join(__dirname, 'views'));


const products = [
    {
        id: 1,
        title: "Product 1"
    },
    {
        id: 2,
        title: "Product 2"
    },
    {
        id: 3,
        title: "Product 3"
    }
]


app.get("/", (req, res) => {
    res.render("home", { title: "Home from node", products: products })
})
app.get("/about", (req, res) => {
    res.render("about", { title: "About", products: products })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});