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


/*

                        __
                       /\ \__
 _____     ___     ____\ \ ,_\   ____
/\ '__`\  / __`\  /',__\\ \ \/  /',__\
\ \ \L\ \/\ \L\ \/\__, `\\ \ \_/\__, `\
 \ \ ,__/\ \____/\/\____/ \ \__\/\____/
  \ \ \/  \/___/  \/___/   \/__/\/___/
   \ \_\
    \/_/

*/

import { userIsLoggedIn } from "./auth";

// Get all Posts in a JSON format
export const getPosts = async (req: any, res: any) => {
  console.log(req.cookies);
  if (req.cookies.auth === undefined) {
    res.status(401);
  } else if (userIsLoggedIn(req.cookies.auth)) {
    const posts = await prisma.posts.findMany();
    res.json(posts);
  }
  res.status(401);
};


interface Post {
  dt_created: any; 
  title: string;
  text: string;
  username: string;
  type: string;
  category: string;
  img: any; // "any" might be the wrong move here, but byte or any version of that didnt seem to work.
}

// Create a new post
// http://localhost:3000/api/auth/makepost
export const createPost = async (req: { body: Post }, res: any) => {
  // Getting the post from the body in a JSON format
  const { dt_created, title, text, username, type, category, img } = req.body;
  // If fields are missing, return an error
  if ( !title || !text || !username || !type || !category) {
    res.sendStatus(400);
    console.log(
      "Missing required fields like title, text, username, type, or category."
    );
    return;
  }
  
  // Try block is important if we want to avoid crashes and catch errors
  // If server crashes, we have to restart it manually :/
  // try { put anything we need to verify first here }
  //Create a new post in the database
  const post = await prisma.posts.create({
    data: {
      dt_created,
      title,
      text,
      username,
      type,
      category,
      img,
    },
  });
  console.log("New post is created: ", post);
};

//WORKING ON RETURNING POST FOR A SINGLE USERNAME


import { getUsername } from "./auth";


//type GET
// http://localhost:3000/api/posts/getMyPosts
export const getMyPosts = async (req: string, res: any) => {
  
  try {
    const result = await prisma.posts.findMany({
      where: {
        username: getUsername.toString(),
      },
    });
    res.json(result); //this means it was successful and returned posts??
    console.log(res.json(result))
  } catch (error) {
    console.log("Unknown error:" + error); //make this more specific 
    res.sendStatus(500);
    return;
  }
};