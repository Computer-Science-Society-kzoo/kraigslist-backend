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

import { verifyTokenAndReturnAccount } from "./auth";

export const createConversation = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  let { postID, message } = req.body;

  if (!postID || !message || !Number.isInteger(postID)) {
    return res
      .status(400)
      .send({ message: "Invalid postID OR missing message" });
  }

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
      },
    });

    const updatedConvesation = await prisma.conversations.update({
      where: {
        conversationID: conversationID,
      },
      data: {
        lastMessage: message,
        lastSenderID: userID,
        newMessages: (conversation.newMessages || 0) + 1,
      },
    });

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
    });
    //console.log("Sending the list of conversations ", conversations);
    res.status(200).json(conversations);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const getAllMessages = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  let username = "";
  let userID = -1;
  let { receiverID } = req.body;

  if (!Number.isInteger(receiverID)) {
    return res.status(400).send({ message: "Invalid receiverID" });
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

    const messages = await prisma.messages.findMany({
      where: {
        AND: [
          {
            senderUID: userID,
          },
          {
            receiverUID: receiverID,
          },
        ],
      },
      orderBy: {
        date: "asc",
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
