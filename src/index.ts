
// Express is a web framework for Node.js that let us build APIs
// https://www.npmjs.com/package/express

import express from "express";
const app = express();
app.use(express.json());


//Cookie Parser is 
const cookieParser = require("cookie-parser");
app.use(cookieParser());


// Cors is a library that let us make cross-origin requests
// We need to limit the origins (websites) that can make requests to our API
// https://www.npmjs.com/package/cors
var cors = require("cors");
var whitelist = ['http://localhost:3000', "http://localhost:3001" /** other domains if any */ ]
var corsOptions = {
  credentials: true,
  origin: function(origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true)
      //callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions)); // !! SHOULD BE CHANGE TO ONLY ALLOW OUR FRONTEND !!

/*
 __                                          ___                 __
/\ \                     __                 /\_ \    __         /\ \__
\ \ \/'\   _ __    __   /\_\     __     ____\//\ \  /\_\    ____\ \ ,_\        ____     __   _ __   __  __     __   _ __
 \ \ , <  /\`'__\/'__`\ \/\ \  /'_ `\  /',__\ \ \ \ \/\ \  /',__\\ \ \/       /',__\  /'__`\/\`'__\/\ \/\ \  /'__`\/\`'__\
  \ \ \\`\\ \ \//\ \L\.\_\ \ \/\ \L\ \/\__, `\ \_\ \_\ \ \/\__, `\\ \ \_     /\__, `\/\  __/\ \ \/ \ \ \_/ |/\  __/\ \ \/
   \ \_\ \_\ \_\\ \__/.\_\\ \_\ \____ \/\____/ /\____\\ \_\/\____/ \ \__\    \/\____/\ \____\\ \_\  \ \___/ \ \____\\ \_\
    \/_/\/_/\/_/ \/__/\/_/ \/_/\/___L\ \/___/  \/____/ \/_/\/___/   \/__/     \/___/  \/____/ \/_/   \/__/   \/____/ \/_/
                                 /\____/
                                 \_/__/
*/

// Start the server
const server = app.listen(3000, () => {
  const message = `
    🚀 Server ready at: http://localhost:3000
    ⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api
    `;
  console.log(message);
});

// Get response from the server's main page
app.get("/", async (req, res) => {
  const message = "Welcome to the the Kraigslist Backend";
  res.send(message);
});

import {login, signup} from "./api/auth";
app.post("/api/auth/login", login);
app.post("/api/auth/signup", signup);

import { deleteAccount  } from "./api/account";
app.post("/api/account/delete", deleteAccount);

import { getUsers, getUser } from "./api/users";
app.get("/users", getUsers);
app.get("/user", getUser);

import { getPosts, getMyPosts, createPost } from "./api/posts";
app.get("/api/posts", getPosts);
app.post("/api/makepost", createPost);
app.get("/api/posts/YourPosts", getMyPosts);

  
