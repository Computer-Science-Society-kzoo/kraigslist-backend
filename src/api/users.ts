// Prisma is a modern DB toolkit to query, migrate and model your database
// It automatically generates and maintains the database schema for us.
// https://www.prisma.io/
import { Prisma, PrismaClient, users } from "@prisma/client";
const prisma = new PrismaClient();

// Express is a web framework for Node.js that let us build APIs
// https://www.npmjs.com/package/express
import express from "express";
const app = express();
app.use(express.json());

// Bcrypt is a library that let us hash passwords before we store them in the database
// https://www.npmjs.com/package/bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10; // The higher the number, the more secure the password

// JWT is a library that let us create and verify tokens
// https://www.npmjs.com/package/jsonwebtoken
var jwt = require("jsonwebtoken");

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


// Get all users in a JSON format
export const getUsers = async (req: any, res: any) => {
    const users = await prisma.users.findMany();
    res.json(users);
  };

  
// Get a specific user by their username
// http://localhost:3000/user/username?=aleksandr
export const getUser = async (req: any, res: any) => {
    const username = req.query.username;
    console.log("Looking for user: ", username);
    const user = await prisma.users.findUnique({
      where: {
        username: String(username),
      },
    });
    console.log("User found. Sending the response back.");
    res.json(user);
  };
  
