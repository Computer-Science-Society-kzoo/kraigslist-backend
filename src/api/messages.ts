// Prisma is a modern DB toolkit to query, migrate and model your database
// It automatically generates and maintains the database schema for us.
// https://www.prisma.io/
import { Prisma, PrismaClient, users } from "@prisma/client";
const prisma = new PrismaClient();

// Express is a web framework for Node.js that let us build APIs
// https://www.npmjs.com/package/express
import express from "express";
import { isNumberObject } from "util/types";
const app = express();
app.use(express.json());

/*

  ___ ___      __    ____    ____     __       __      __    ____
/' __` __`\  /'__`\ /',__\  /',__\  /'__`\   /'_ `\  /'__`\ /',__\
/\ \/\ \/\ \/\  __//\__, `\/\__, `\/\ \L\.\_/\ \L\ \/\  __//\__, `\
\ \_\ \_\ \_\ \____\/\____/\/\____/\ \__/.\_\ \____ \ \____\/\____/
 \/_/\/_/\/_/\/____/\/___/  \/___/  \/__/\/_/\/___L\ \/____/\/___/
                                               /\____/
                                               \_/__/
*/

import { wsServer } from "../index";
import { verifyTokenAndReturnAccount } from "./auth";

const moment = require('moment');

export const createConversation = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  let { postID, message } = req.body;

  if (!postID || !message || !Number.isInteger(postID)) {
    console.log("Invalid request");
    return res
      .status(400)
      .send({ message: "Invalid postID OR missing message" });
  }

  let username = "";
  let userID = -1;
  try {
    if (token === undefined) {
      console.log("No token provided");
      res.status(401).send("No token provided");
      return;
    }

    const account = await verifyTokenAndReturnAccount(token);

    if (account === undefined) {
      console.log("Invalid token");
      res.status(401).send("Token is invalid");
      return;
    }

    username = account.username;
    userID = account.id;
  } catch (e) {
    console.log(e);
    return;
  }

  try {
    const post = await prisma.posts.findUnique({
      where: {
        id: postID,
      },
    });

    if (post === null) {
      return res.status(400).send({ message: "Invalid postID (2)" });
    }

    const newMessage = await prisma.messages.create({
      data: {
        senderUID: userID,
        receiverUID: post.userID,
        message: message,
        postID: postID,
      },
    });

    const newConvesation = await prisma.conversations.create({
      data: {
        senderUID: userID,
        receiverUID: post.userID,
        postID: postID,
        lastSenderID: userID,
        lastMessage: message,
        newMessages: 1,
      },
    });

    const user = await prisma.users.findUnique({
      where: {
        id: userID,
      },
    });

    // Send notification to the other user
    sendNewMessageNotification(post.userID, user?.username || "Unknown user", newConvesation.conversationID, message);
  
    res.status(200).json({ "Succesfully send?": true, message });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const sendMessage = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  let { conversationID, message } = req.body;

  if (!message || !Number.isInteger(conversationID)) {
    return res
      .status(400)
      .send({
        message: "Invalid conversationID OR missing message OR receiverID",
      });
  }

  let userID = -1;
  try {
    if (token === undefined) {
      res.status(401).send("No token provided");
      return;
    }

    const account = await verifyTokenAndReturnAccount(token);

    if (account === undefined) {
      res.status(401).send("Token is invalid");
      return;
    }

    userID = account.id;
  } catch (e) {
    console.log(e);
    return;
  }

  try {
    const conversation = await prisma.conversations.findUnique({
      where: {
        conversationID: conversationID,
      },
    });

    if (conversation === null) {
      return res.status(400).send({ message: "Invalid conversationID (2)" });
    }

    // Check if the user is the sender or receiver
    let receiver = conversation.receiverUID;
    if (receiver === userID) {
      receiver = conversation.senderUID;
    }
    

    const newMessage = await prisma.messages.create({
      data: {
        senderUID: userID,
        receiverUID: receiver || 0,
        message: message,
        postID: conversation.postID || 0,
      },
    });

    const updatedConvesation = await prisma.conversations.update({
      where: {
        conversationID: conversationID,
      },
      data: {
        lastMessage: message,
        lastSenderID: userID,
        date: moment().toDate(),
        newMessages: (conversation.newMessages || 0) + 1,
      },
    });

    const user = await prisma.users.findUnique({
      where: {
        id: userID,
      },
    });

    sendNewMessageNotification(receiver || 0, user?.username || "Unknown user", conversationID, message);
  

    res.status(200).json({ "Succesfully send and updated?": true, message });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const getAllConversations = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  let username = "";
  let userID = -1;
  try {
    if (token === undefined) {
      res.status(401).send("No token provided");
      return;
    }

    const account = await verifyTokenAndReturnAccount(token);

    if (account === undefined) {
      res.status(401).send("Token is invalid");
      return;
    }

    username = account.username;
    userID = account.id;
  } catch (e) {
    console.log(e);
    return;
  }

  try {
    const conversations = await prisma.conversations.findMany({
      where: {
        OR: [
          {
            senderUID: userID,
          },
          {
            receiverUID: userID,
          },
        ],
      },
      orderBy: {
        date: "desc",
      },
    });

    let sendData = [];
    //get username from userID
    for (let i = 0; i < conversations.length; i++) {

      let comradeID = conversations[i].senderUID;
      if (comradeID === userID) {
        comradeID = conversations[i].receiverUID;
      }
      const comrade = await prisma.users.findUnique({
        where: {
          id: comradeID || 0,
        },  
      });
      let item = {...conversations[i], name: comrade?.username, comID: comrade?.id};
      sendData.push(item);
    }
    
    //console.log("Sending the list of conversations ", conversations);
    res.status(200).json(sendData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const getAllMessages = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  const receiverID = Number.parseInt(req.headers["comradeid"])
  const postID = Number.parseInt(req.headers["postid"])
  const conversationID = Number.parseInt(req.headers["conversationid"])

  let username = "";
  let userID = -1;

  if (!Number.isInteger(receiverID) || !Number.isInteger(postID) || !Number.isInteger(conversationID) || receiverID <= 0 || postID <= 0 || conversationID <= 0) {
    console.log("Invalid receiverID: " + typeof(receiverID) + " " + receiverID + " postID: " + typeof(postID) + " " + postID + " conversationID: " + typeof(conversationID) + " " + conversationID);
    return res.status(400).send({ message: "Invalid receiverID or postID or conversationID" });
  }

  try {
    if (token === undefined) {
      res.status(401).send("No token provided");
      return;
    }

    const account = await verifyTokenAndReturnAccount(token);

    if (account === undefined) {
      res.status(401).send("Token is invalid");
      return;
    }

    username = account.username;
    userID = account.id;
  } catch (e) {
    console.log(e);
    return;
  }

  try {
    //get messages by userid and sort them by date
    //get only 15 messages 
    //SELECT TOP 10 first_name, last_name, score, COUNT(*) OVER()
// FROM players
//WHERE (score < @previousScore)
   //OR (score = @previousScore AND player_id < @previousPlayerId)
// ORDER BY score DESC, player_id DESC

    //get only 10 messages between two dates 
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                senderUID: userID,
              },
              {
                receiverUID: receiverID,
              },
              {
                postID: postID,
              }
            ],
          },
          {
            AND: [
              {
                senderUID: receiverID,
              },
              {
                receiverUID: userID,
              },
              {
                postID: postID,
              }
            ],
          },

        ],
      },
      orderBy: {
        date: "asc",
      },
    });

    await prisma.conversations.update({
      where: {
        conversationID: conversationID,
      },
      data: {
        newMessages: 0,
      },
    });

    //console.log("Sending the list of messages ", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const seeAllMessages = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  let { conversationID } = req.body;

  if (!Number.isInteger(conversationID)) {
    return res
      .status(400)
      .send({
        message: "Invalid conversationID OR missing message OR receiverID",
      });
  }

  try {
    if (token === undefined) {
      res.status(401).send("No token provided");
      return;
    }

    const account = await verifyTokenAndReturnAccount(token);

    if (account === undefined) {
      res.status(401).send("Token is invalid");
      return;
    }

  } catch (e) {
    console.log(e);
    return;
  }

  try {
    const conversation = await prisma.conversations.findUnique({
      where: {
        conversationID: conversationID,
      },
    });

    if (conversation === null) {
      return res.status(400).send({ message: "Invalid conversationID (2)" });
    }

    const updatedConvesation = await prisma.conversations.update({
      where: {
        conversationID: conversationID,
      },
      data: {
        newMessages: 0
      },
    });

    res.status(200).json({ "Succesfully seen all messages?": true});
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const getTotalUnreadMessagesPerUser = async (req: any, res: any) => {

  const token = req.headers["authorization"]?.slice(7);

  let username = "";
  let userID = -1;

  try {
    if (token === undefined) {
      res.status(401).send("No token provided");
      return;
    }

    const account = await verifyTokenAndReturnAccount(token);

    if (account === undefined) {
      res.status(401).send("Token is invalid");
      return;
    }

    username = account.username;
    userID = account.id;
  } catch (e) {
    console.log(e);
    return;
  }

  try {
    const conversations = await prisma.conversations.findMany({
      where: {
        OR: [
          {
            senderUID: userID,
          },
          {
            receiverUID: userID,
          },
        ],
      },
    });

    let total = 0;
    for (let i = 0; i < conversations.length; i++) {
      total += conversations[i].newMessages || 0;
    }

    res.status(200).json({total: total});
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }

}

// Send a message to a user
function sendNewMessageNotification(userID: number, sender: string, conversationID: number , message: string) {
  try {
    wsServer.SendToUser(userID, {
      type: "newMessage",
      data: {
        sender: sender,
        conversationID: conversationID,
        message: message,
      },
    });
  } catch (e) {
    console.log(e);
  }
}