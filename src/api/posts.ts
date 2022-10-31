// Prisma is a modern DB toolkit to query, migrate and model your database
// It automatically generates and maintains the database schema for us.
// https://www.prisma.io/
import { Prisma, PrismaClient, users } from "@prisma/client";
import { Blob } from "buffer";
import e from "express";
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

// Get all Posts in a JSON format by most recent
export const getPosts = async (req: any, res: any) => {
  console.log(req.cookies); 
  if (req.cookies.auth === undefined) { 
    res.status(401); 
  } else if (userIsLoggedIn(req.cookies.auth)) {
    const posts = await prisma.posts.findMany({
      orderBy: [
        {
          dt_created: 'desc',
        },
      ],}
    ); 
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
  offer_deadline: any;
  price: number;
  img: any; // "any" might be the wrong move here, but byte or any version of that didnt seem to work.
}

import { getUserName2 } from "./auth";
import { verifyTokenAndReturnAccount } from "./auth";

// Create a new post
// http://localhost:3000/api/auth/makepost
export const createPost = async (
  req: { headers: any; body: Post2 },
  res: any
) => {
  // Getting the post from the body in a JSON format
  //(assuming you have a ResultSet named RS)
  //get a token
  // If fields are missing, return an error
  const token = req.headers["authorization"]?.slice(7);
  let username = ""
  let userID = -1;
  try {
    if (token === undefined) {
      res.status(401).send("No token provided");
    }
    let account = await verifyTokenAndReturnAccount(token);
    if (account === undefined) {
      res.status(401).send("Token is invalid");
    }

    username = account.username;
    userID = account.id;

  } catch (e) {
    console.log(e);
    return;
  }
  const dt_created = new Date();
  const { title, text, type, category, offer_deadline, price, img } = req.body;
  if (!title || !text || !username || !type || !category) {
    res.sendStatus(400);
    console.log("Missing required fields like title, text, type, or category.");
    return;
  } else {
    try {
      // const blob:Blob = img;
      // var blobLength:number = img.byteLength;;
      // var blobArray = new Uint8Array(img);
      //   for (var i = 0; i < blobLength; i++) {
      //       blobArray[i] = img.getUint8(i);
      //   }

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
          offer_deadline,
          price,
          img,
          userID
        },
      });
      console.log("New post is created: ", post);
      res.status(200).send("Post created");
    } catch (error) {
      console.log(error);
      res.status(500).send("Error creating post");
      return;
    }
  }
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

//make a request to find posts with either a title or text that contains the search term
//type GET
export const searchPosts = async (toSearch: string, res: any) => {
try { 
    const result = await prisma.posts.findMany({
        where: {
            OR: [ 
                {title: {contains: toSearch}},
                {text: {contains: toSearch}}  
            ]
        }
    });
    res.json(result); //this means it was successful and returned posts
    console.log("Posts returned for search term: ", result);
} catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
} 
};


//make a request to find posts with a specific category, can take any string so front end will need
//to make sure the user can only choose form a list of categories
//type GET
export const searchPostsByCategory = async (category: string, res: any) => {
try { 
    const result = await prisma.posts.findMany({
        where: {
            category: category
        }
    });
    res.json(result); //this means it was successful and returned posts
    console.log("Posts returned for category: ", result);
} catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
} 
}

//make a request to find posts with a specific type. right now i have it accepting any string, so front end will
//have to make sure they are limiting the user to only selecting "request" or "offer"
//type GET
export const getPostsByType = async (type: string, res: any) => {
try { 
    const result = await prisma.posts.findMany({
        where: {
            type: type
        }
    });
    res.json(result); //this means it was successful and returned posts
    console.log("Posts returned for type: ", result);
} catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
} 
}

//make a request to organize posts by expiration date. i dont think that the filters can stack right now just fyi
//type GET
export const getPostsByDeadline = async (res: any) => {
try { 
    const result = await prisma.posts.findMany({
        orderBy: {
            offer_deadline: 'asc'
        }
    });
    res.json(result); //this means it was successful and returned posts
    console.log("Posts returned by oldest deadline first: ", result);
} catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
} 
}

//make a request to organize posts by price (lowest to highest)
//type GET
export const getPostsByPrice = async (res: any) => {
try { 
    const result = await prisma.posts.findMany({
        orderBy: {
            price: 'asc'
        }
    });
    res.json(result); //this means it was successful and returned posts
    console.log("Posts returned by lowest price first: ", result);
} catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
}
}
