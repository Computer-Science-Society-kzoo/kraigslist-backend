import { Prisma, PrismaClient, users } from "@prisma/client";
import { Blob } from "buffer";
import e from "express";
const prisma = new PrismaClient();

// Express is a web framework for Node.js that let us build APIs
// https://www.npmjs.com/package/express
import express from "express";
import { verifyTokenAndReturnAccount } from "./auth";
const app = express();
app.use(express.json());

// JWT is a library that let us create and verify tokens
// https://www.npmjs.com/package/jsonwebtoken
var jwt = require("jsonwebtoken");
require('dotenv').config()

const { Configuration, OpenAIApi } = require("openai");

export const aiAssistMessage = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);

  const { text, post } = req.body;

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

    const postText = "Here is the post written for a request / offer / sell / buy platform: " + post + '/n Reply to it: /n' + text  
    console.log(postText)

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);
      
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: postText,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });


      const data = response.data.choices[0].text;
    console.log(response.data.choices[0].text);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};

export const aiAssistPost = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);

  const { text } = req.body;

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

    const postText = "Continue the post written for a request / offer / sell / buy platform: " + '/n' + text  
    console.log(postText)

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);
      
      const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: postText,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });


      const data = response.data.choices[0].text;
    console.log(response.data.choices[0].text);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving conversations");
    return;
  }
};
