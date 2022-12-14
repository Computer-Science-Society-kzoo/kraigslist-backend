
// Express is a web framework for Node.js that let us build APIs
// https://www.npmjs.com/package/express

import express from "express";
const app = express();
app.use(express.json());

const https = require("https");
const fs = require('fs')


//Cookie Parser is 
const cookieParser = require("cookie-parser");
app.use(cookieParser());


// Cors is a library that let us make cross-origin requests
// We need to limit the origins (websites) that can make requests to our API
// https://www.npmjs.com/package/cors
var cors = require("cors");
var whitelist = ['http://localhost:3000', "http://localhost:3001" /** other domains if any */]
var corsOptions = {
  credentials: true,
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true)
      //callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions)); // !! SHOULD BE CHANGE TO ONLY ALLOW OUR FRONTEND !!

const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');



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



/*
88""Yb 888888 .dP"Y8 888888        db    88""Yb 88     .dP"Y8 888888 88""Yb Yb    dP 888888 88""Yb
88__dP 88__   `Ybo."   88         dPYb   88__dP 88     `Ybo." 88__   88__dP  Yb  dP  88__   88__dP
88"Yb  88""   o.`Y8b   88        dP__Yb  88"""  88     o.`Y8b 88""   88"Yb    YbdP   88""   88"Yb
88  Yb 888888 8bodP'   88       dP""""Yb 88     88     8bodP' 888888 88  Yb    YP    888888 88  Yb



*/

//check if file exist

require('dotenv').config()
if (process.env.NODE_ENV === "production") {
  https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/bkl1.kzoocss.org/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/bkl1.kzoocss.org/fullchain.pem'),
    //passphrase: fs.readFileSync('certs/pass.pem', "utf8").toString().trim()
      
  }, app).listen(4000, () => {
    console.log('      ???? REST APIs Server ready at: https://bkl1.kzoocss.org (locally at port 4000)');
  })
} else if (process.env.NODE_ENV === "development") {

  const server = app.listen(3000, () => {
    const message = `
      ???? REST APIs Server ready at: http://localhost:3000
      `;
    console.log(message);
  });
} else {
  console.log("???? NODE_ENV is not set ????");
  console.log("Please set NODE_ENV to either 'development' or 'production' in .env file\n\n" );
  process.exit(1);
}

// Get response from the server's main page
app.get("/", async (req, res) => {
  const message = "Welcome to the the Kraigslist Backend";
  res.send(message);
});

import { login, signup, verifyTokenAndReturnAccount } from "./api/auth";
app.post("/api/auth/login", login);
app.post("/api/auth/signup", signup);

import { deleteAccount, changeUsername, changeEmail, changePassword, changeFirstName, changeSurname, changeYear, getUsername  } from "./api/account";
app.delete("/api/account/delete", deleteAccount);
app.post("/api/account/changeUsername", changeUsername);
app.post("/api/account/changeEmail", changeEmail);
app.post("/api/account/changePassword", changePassword);
app.post("/api/account/changeFirstName", changeFirstName);
app.post("/api/account/changeSurname", changeSurname);
app.post("/api/account/changeYear", changeYear);
app.get("/api/account/getusername", getUsername);

import { getUsers, getUser } from "./api/users";
app.get("/users", getUsers);
app.get("/user", getUser);

import { getPosts, getMyPosts, createPost, searchPosts, getPostsMaster, myPosts } from "./api/posts";
app.get("/api/posts", getPosts);
app.get("/api/posts/master", getPostsMaster);
app.post("/api/posts/makepost", createPost);
app.get("/api/posts/searchPosts", searchPosts);
app.get("/api/posts/getmyposts", getMyPosts);

import { getAllConversations, createConversation, getAllMessages, sendMessage, getTotalUnreadMessagesPerUser} from "./api/messages";
app.get("/api/messages/allconversations", getAllConversations);
app.post("/api/messages/newconversation", createConversation);
app.get("/api/messages/allmessages", getAllMessages);
app.post("/api/messages/send", sendMessage);
app.get("/api/messages/totalmessages", getTotalUnreadMessagesPerUser);

import { aiAssistMessage, aiAssistPost } from "./api/openai";
app.post("/api/openai/aiassistpost", aiAssistPost);
app.post("/api/openai/aiassistmessage", aiAssistMessage);



/*
Yb        dP 888888 88""Yb     .dP"Y8  dP"Yb   dP""b8 88  dP 888888 888888     .dP"Y8 888888 88""Yb Yb    dP 888888 88""Yb
 Yb  db  dP  88__   88__dP     `Ybo." dP   Yb dP   `" 88odP  88__     88       `Ybo." 88__   88__dP  Yb  dP  88__   88__dP
  YbdPYbdP   88""   88""Yb     o.`Y8b Yb   dP Yb      88"Yb  88""     88       o.`Y8b 88""   88"Yb    YbdP   88""   88"Yb
   YP  YP    888888 88oodP     8bodP'  YbodP   YboodP 88  Yb 888888   88       8bodP' 888888 88  Yb    YP    888888 88  Yb
*/

const webSocketOnlineServer = http.createServer()

webSocketOnlineServer.listen(4500
  , () => {
    console.log('      ????  Web Socket Server ready at: http://localhost:4500')    
    });

export const wsServer = new webSocketServer({
  httpServer: webSocketOnlineServer
});


const clients: any = {};

wsServer.on('error', (err:any) => console.log('uncaught ERROR: ', err));
wsServer.on('request', function (request: any) {
  console.log('Connection from origin ' + request.origin + '.');
  //get bearer token from request
  console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');

  //get access_token

  let token = ""


  try {
    token = request.httpRequest.url.split('=')[1]
  } catch (error) {
    console.log("???? No token in url found ????")
  }
  
  if (token === undefined) {
    try{
      token = request.httpRequest.headers.cookie.split('=')[1].split(';')[0] || undefined
    } catch (error) {}
  }
  
  if (token == undefined) {
    console.log("TOKEN: " + token);
    console.log("no token");
    request.reject();
    return;
  }

  let connection = null
  let account = null;
  try {
    account = verifyTokenAndReturnAccount(token);
    var userID = account.id;
    // You can rewrite this part of the code to accept only the requests from allowed origin
    connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log(token)
    console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients) + " with token: " + token);
  } catch (error) {
    console.log(error);
    console.log(token)
    connection = request.reject();
  }

  wsServer.SendToUser(userID, { type: 'connected', data: 'connected' });
  wsServer.SendToUser(userID, { type: 'connected', data: 'secondtest' });



});

wsServer.SendToUser = function (userID: any, message: any) {
  if (clients[userID]) {
    console.log("Sending data (" + message.type + ")  to user: " + userID);
    clients[userID].send(JSON.stringify(message));
  }
}