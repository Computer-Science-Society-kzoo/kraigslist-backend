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

// JWT is a library that let us create and verify tokens
// https://www.npmjs.com/package/jsonwebtoken
var jwt = require("jsonwebtoken");
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

import { userIsLoggedIn, verifyTokenAndReturnAccount } from "./auth";

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
      ],
    }
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
  img: any; // "any" might be the wrong move here, but byte or any version of that didnt seem to work.
}

interface Post2 {
  title: string;
  text: string;
  type: string;
  offer_deadline: any;
  price: number;
  img: any; // "any" might be the wrong move here, but byte or any version of that didnt seem to work.
}

interface searchP {
  text: string;
}

import { getUserName2 } from "./auth";
//import { verifyTokenAndReturnAccount } from "./auth";
// import { verifyTokenAndReturnUser } from "./auth";

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
  const { title, text, type, offer_deadline, price, img } = req.body;
  if (!title || !text || !username || !type) {
    res.sendStatus(400);
    console.log("Missing required fields like title, text, or type.");
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
      res.status(500).send("Error creating post: " + error);
      return;
    }
  }
};

// Get a post by its ID
// http://localhost:3000/api/posts/getMyPosts
export const myPosts = async (req: any, res: any) => {
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
    const post = await prisma.posts.findMany({
      where: {
        userID: userID,
      },
    });
    res.status(200).send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting posts");
    return;
  }
};


//get token
//type GET
// http://localhost:3000/api/posts/getMyPosts
export const getMyPosts = async (req: any, res: any) => {
  console.log("TEST")
  //get a token
  // If fields are missing, return an error

  const token = req.headers["authorization"]?.slice(7);
  const conID = req.headers["conid"];

  let username = ""
  console.log("TOKEN: ", token)
  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
      return
    }
    let account = await verifyTokenAndReturnAccount(token);
    if (account === undefined) {
      res.status(401).send("Token is invalid");
    }

    username = account.username;

  } catch (e) {
    console.log(e);
    return;
  }
  try {
    const result = await prisma.posts.findMany({
      where: {
        username: username,
      },
    });
    res.status(200).json(result); //if successful, return posts

  } catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
  }
};


//make a request to find posts with either a title or text that contains the search term
//CAN BE DELETED?
//type GET
// http://localhost:3000/api/posts/searchPosts
export const searchPosts = async (req: any, res: any) => {
  try {
    let toSearch = req.query.text;
    const result = await prisma.posts.findMany({
      where: {
        OR: [
          { title: { contains: toSearch } },
          { text: { contains: toSearch } }
        ]
      }
    });
    res.json(result); //this means it was successful and returned posts
    //console.log("Posts returned for search term: ", result);
  } catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
  }
};

//type GET
// http://localhost:3000/api/posts/getPostsMaster
export const getPostsMaster = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  const conID = req.headers["conid"];

  console.log("TOKEN: ", token)
  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
      return
    }
    let account = await verifyTokenAndReturnAccount(token);
    if (account === undefined) {
      res.status(401).send("Token is invalid");
    }

  } catch (e) {
    console.log(e);
    return;
  }

  try {

    let toSearch = req.query.text;
    //let filter = req.query.filter;
    let filter: string[] = req.query.filter;
    let filter2 = req.query.filter2; //price filter
    let priceFilter = filter2 //for clarity
    let filter3 = req.query.filter3; //deadline filter (desc posts with deadlines only)
    let deadlineFilter = filter3 //for clarity
    console.log("deadine implemented?: " + deadlineFilter);
    console.log("filter2/priceFilter: " + priceFilter);
    console.log("filter: " + filter);
    console.log("toSearch: " + toSearch);
    if (toSearch != "" && filter[0] != "" && priceFilter != "" && deadlineFilter != "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {

          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } },
          ],
          AND: [
            { type: { in: filter } },
            {
              price: {
                not: null
              },
            },
            {
              offer_deadline: {
                not: null
              }
            }
          ]
        },
        orderBy: [
          {
            price: priceFilter, //this is the variable that will be either "asc" or "desc", might not work because price query needs to be in single quotes
            offer_deadline: deadlineFilter //will be "asc" because we want the soonest deadline to be first
          }
        ]
      });
      res.json(result); //this means it was successful and returned posts with normal search and price:asc
      console.log("Posts returned for search term: ", result);
    }
    else if (toSearch != "" && filter[0] != "" && priceFilter != "" && deadlineFilter == "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {

          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ],
          AND: [
            { type: { in: filter } },
            {
              price: {
                not: null
              }
            }
          ]
        },
        orderBy: [
          {
            price: priceFilter, //this is the variable that will be either "asc" or "desc"
          }
        ]
      });
      res.json(result); //this means it was successful and returned posts with normal search and price:asc
      console.log("Posts returned for search term: ", result);
    }
    else if (toSearch != "" && filter[0] != "" && priceFilter == "" && deadlineFilter != "") {
      const result = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ],
          AND: [
            { type: { in: filter } },
            {
              offer_deadline: {
                not: null
              }
            }
          ]
        },
        orderBy: [
          {
            offer_deadline: deadlineFilter
          }
        ]
      })
      res.json(result); //this means it was successful and returned posts with normal search & filter
      //console.log("Posts returned for search term: ", result);
    }
    else if (toSearch != "" && filter[0] != "" && priceFilter == "" && deadlineFilter == "") {
      const result = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ],
          AND: [
            { type: { in: filter } },
          ]
        },
        orderBy: [
          {
            dt_created: "desc"
          }
        ]
      })
      res.json(result); //this means it was successful and returned posts with normal search & filter
      //console.log("Posts returned for search term: ", result);
    }
    else if (toSearch != "" && filter[0] == "" && priceFilter == "" && deadlineFilter != "") {
      const result = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ],
          AND: [
            {
              offer_deadline: {
                not: null
              }
            }
          ]
        },
        orderBy: [
          {
            offer_deadline: deadlineFilter
          }
        ]
      });
      res.json(result); //this means it was successful and returned posts
    }
    else if (toSearch != "" && filter[0] == "" && priceFilter == "" && deadlineFilter == "") {
      const result = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ]
        },
        orderBy: [
          {
            dt_created: "desc"
          }
        ]
      });
      res.json(result); //this means it was successful and returned posts
    }
    else if (toSearch == "" && filter[0] != "" && priceFilter != "" && deadlineFilter != "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {
          AND: [
            { type: { in: filter } },
            {
              offer_deadline: {
                not: null
              }
            },
            {
              price: {
                not: null
              }
            },
            {
              offer_deadline: {
                not: null
              }
            }
          ],
        },
        orderBy: [
          {
            price: priceFilter,
            offer_deadline: deadlineFilter
          }
        ]
      });
    }
    else if (toSearch == "" && filter[0] != "" && priceFilter != "" && deadlineFilter == "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {
          AND: [
            { type: { in: filter } },
          ],
          NOT: [
            { price: null }
          ]
        },
        orderBy: [
          {
            price: priceFilter,
          }
        ]
      });

      res.json(result); //this means it was successful and returned posts
      //console.log("Posts returned for search term: ", result);
    }
    else if (toSearch == "" && filter[0] == "" && priceFilter != "" && deadlineFilter != "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {
          price: {
            not: null
          },
          offer_deadline: {
            not: null
          }

        },
        orderBy: [
          {
            price: priceFilter, //this is the variable that will be either "asc" or "desc", might not work because price query needs to be in single quotes
            offer_deadline: deadlineFilter
          },
        ],
      })
      res.json(result);
    }
    else if (toSearch == "" && filter[0] == "" && priceFilter != "" && deadlineFilter == "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {
          price: {
            not: null
          }
        },
        orderBy: [
          {
            price: priceFilter, //this is the variable that will be either "asc" or "desc", might not work because price query needs to be in single quotes

          },
        ],
      })
      res.json(result);
    }
    else if (toSearch == "" && filter[0] != "" && priceFilter == "" && deadlineFilter != "") {
      const result = await prisma.posts.findMany({
        where: {
          AND: [
            { type: { in: filter } },
            {
              offer_deadline: {
                not: null
              }
            }
          ]
        },
        orderBy: [
          {
            offer_deadline: deadlineFilter
          }
        ]
      });
      res.json(result);
    }
    else if (toSearch == "" && filter[0] != "" && priceFilter == "" && deadlineFilter == "") {
      const result = await prisma.posts.findMany({
        where: {
          AND: [
            { type: { in: filter } },
          ]
        },
        orderBy: [
          {
            dt_created: "desc"
          }
        ]
      });
      res.json(result);
    }
    else if (toSearch != "" && filter[0] == "" && priceFilter != "" && deadlineFilter != "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ],
          AND: [
            {
              price: {
                not: null
              }
            },
            {
              offer_deadline: {
                not: null
              }
            }
          ]
        },
        orderBy: [
          {
            price: priceFilter,
            offer_deadline: deadlineFilter
          }
        ]
      });
      res.json(result);
    }
    else if (toSearch != "" && filter[0] == "" && priceFilter != "" && deadlineFilter == "") {
      console.log("the order of prices to be shown is: " + priceFilter);
      const result = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: toSearch } },
            { text: { contains: toSearch } }
          ],
          NOT: [
            { price: null }
          ]
        },
        orderBy: [
          {
            price: priceFilter,
          }
        ]
      });
      res.json(result);
    }
    else if (toSearch == "" && filter[0] == "" && priceFilter == "" && deadlineFilter != "") {
      const result = await prisma.posts.findMany({
        where: {
          AND: [
            {
              offer_deadline: {
                not: null
              }
            }]
        },
        orderBy: [
          {
            offer_deadline: deadlineFilter
          }
        ]
      });
      res.json(result);
    }
    else {
      const result = await prisma.posts.findMany({
        orderBy: [
          {
            dt_created: "desc",
          },
        ],
      }
      );
      res.json(result);
    }

  } catch (error) {
    console.log("Unknown error:" + error); //make this more specific
    res.sendStatus(500);
    return;
  }
};

//Delete a single post in the database
const deletePost = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);
  const conID = req.headers["conid"];

  console.log(token);

  let username = "";

  if (!token) {
    return res.status(401).send({ auth: false, message: "No token provided." });
  }

  if (!conID) {
    return res.status(401).send({ auth: false, message: "No conID provided." });
  }

  await jwt.verify(
    token,
    process.env.JWT_SECRET,
    function (err: any, decoded: any) {
      if (err) {
        return res
          .status(500)
          .send({ auth: false, message: "Failed to authenticate token." });
      }
      // if everything good, save to request for use in other routes
      username = decoded.username;
    }
  );
  try {

    const post = await prisma.posts.findUnique({
      where: {
        id: parseInt(conID),
      },
    });

    if (post?.username != username) {
      return res.status(401).send({ auth: false, message: "Not authorized." });
    } else {
      const deletePost = await prisma.posts.delete({
        where: {
          id: conID,
        },
      });
    }

    console.log(username + "deleted a post");
    res.status(200).send("Post deleted");
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
}