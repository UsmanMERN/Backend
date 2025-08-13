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


import EventEmitter from "events"

class MyCustomEmitter extends EventEmitter {
    greeting;
    constructor() {
        super();
        this.greeting = "Hellow"
    }
    greet(name: string) {
        this.emit('greeting', `${this.greeting},${name}`)
    }
}

const myCustomEmitter = new MyCustomEmitter()

myCustomEmitter.on('greeting', (input) => {
    console.log('greeting input :>> ', input);
})


myCustomEmitter.greet("Usman")

// http
// callback and callbackhell
// promises
// async await
// event emitter
// path
// fs (file system)