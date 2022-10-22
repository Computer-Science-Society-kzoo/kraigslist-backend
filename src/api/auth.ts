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

interface User {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    preferred_name: string;
    year: number;
  }

// Create a new user
// http://localhost:3000/api/auth/signup
// don't forget to attach the JSON body to the request
export const signup =  async (req: { body: User }, res: any) => {
    // Getting the user from the body in a JSON format
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      preferred_name,
      year,
    } = req.body;
    // If fields are missing, return an error
    if (!username || !email || !password || !first_name || !last_name || !year) {
      res.sendStatus(400);
      console.log("Missing required fields.");
      return;
    }
    // Try block is important if we want to avoid crashes and catch errors
    // If server crashes, we have to restart it manually :/
    try {
      // Hash the password before storing it in the database (later use bscrypt.compare to check the password)
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      //Create a new user in the database
      const user = await prisma.users.create({
        data: {
          username,
          email,
          password: hashedPassword,
          first_name,
          last_name,
          preferred_name,
          year,
        },
      });
      console.log("New user is created: ", user);
  
      // Generate a token for the user to use in the future
      const token = jwt.sign(
        {
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );
  
      console.log("Token generated: ", token);
      // Save the result
      const result = { ...user, token };
      // Send a success response
      res.status(200).json(result);
    } catch (error) {
      // If the error is known...
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // If the error is a unique constraint violation... (username exists)
        if (error.code === "P2002") {
          console.log(
            "There is a unique constraint violation, a new user cannot be created with this username."
          );
          res.sendStatus(409);
          return;
        }
      }
      console.log("Unknown error:" + error);
      res.sendStatus(500);
      return;
    }
  };


  interface LoginCredentials {
    email: string;
    password: string;
  }
  
// Login a user
// http://localhost:3000/api/auth/login
// don't forget to attach the JSON body to the request

export const login = async (req: { body: { email: string; password: string } }, res: any) => {
    const { email, password } = req.body;
    if (!email || !password) {
    res.sendStatus(400);
    console.log("Missing required fields.");
    return;
    }
    try {
    const user = await prisma.users.findUnique({
        where: {
        email: String(email),
        },
    });
    if (user) {
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
        const token = jwt.sign(
            {
            username: user.username,
            email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );
        const result = token;
        res.status(200).json(result);
        } else {
        res.sendStatus(401);
        }
    } else {
        res.sendStatus(404);
    }
    } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
    }
};

export function userIsLoggedIn(token: string): boolean {
    console.log("Trying to verify token: " + token);
    try {
      var decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      return true;
    } catch (err) {
      console.log(err);
    }
    return false;
  }
  