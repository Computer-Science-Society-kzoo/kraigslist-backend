// Prisma is a modern DB toolkit to query, migrate and model your database
// It automatically generates and maintains the database schema for us.
// https://www.prisma.io/
import { Prisma, PrismaClient, users } from "@prisma/client";
import { Blob } from "buffer";
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

interface Post2 {
  title: string;
  text: string;
  type: string;
  category: string;
  img: any; // "any" might be the wrong move here, but byte or any version of that didnt seem to work.
}

import {  getUserName2 } from "./auth";

// Create a new post
// http://localhost:3000/api/auth/makepost
export const createPost = async (req: { body: Post2 }, res: any) => {
  // Getting the post from the body in a JSON format
//(assuming you have a ResultSet named RS)

  var usersname = getUserName2();
  const username = usersname;
  const dt_created = new Date();
  const {title, text, type, category, img } = req.body;
  // const blob:Blob = img;
  // var blobLength:number = img.byteLength;;  
  // var blobArray = new Uint8Array(img);
  //   for (var i = 0; i < blobLength; i++) {
  //       blobArray[i] = img.getUint8(i);
  //   }

  console.log(img)

  // If fields are missing, return an error
  if ( !title || !text || !username || !type || !category) {
    res.sendStatus(400);
    console.log(
      "Missing required fields like title, text, type, or category."
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


//type GET
// http://localhost:3000/api/posts/getMyPosts
export const getMyPosts = async (req: string, res: any) => {
  var un = getUserName2();
  console.log(un);
  try {
    const result = await prisma.posts.findMany({
      where: {
        username: un,
      },
    });
    res.json(result); //this means it was successful and returned posts??
    console.log("Posts returned for username: ", result);
    //console.log(getUsername.toString())
  } catch (error) {
    console.log("Unknown error:" + error); //make this more specific 
    res.sendStatus(500);
    return;
  }
};

//Tabitha's work in progress for search bar
// export const searchPosts = async (toSearch: string, res: any) => {
  

export const searchPosts = async (req: string, res: any) => {
// All drafts that contain the words 'cat' and 'dog'.
const result = await prisma.posts.findMany({
  where: {
    text: {
      search: '+cat +dog',
    },
  },
})
};