import { Prisma, PrismaClient, users } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());


// Start the server
const server = app.listen(3000, () => {
  const message = `
    🚀 Server ready at: http://localhost:3000
    ⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api
    `;
  console.log(message);
});

// Get response from the server's main page
app.get("/", async (req, res) => {
  const message = "Welcome to the the Kraigslist Backend";
  res.send(message);
});


// Get all users in a JSON format
app.get("/users", async (req, res) => {
  const users = await prisma.users.findMany();
  res.json(users);
})

// Get a specific user by their username
// http://localhost:3000/user/username?=aleksandr
app.get("/user", async (req, res) => {
  const username = req.query.username;
  console.log("Looking for user: ", username);
  const user = await prisma.users.findUnique({
    where: {
      username: String(username),
    },
  });
  console.log("User found. Sending the response back.");
  res.json(user);
})


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
app.post('/api/auth/signup', async (req: {body: User}, res) => {
  // Getting the user from the body in a JSON format
  const { username, email, password, first_name, last_name, preferred_name, year } = req.body;
  // If fields are missing, return an error
  if (!username || !email || !password || !first_name || !last_name || !year) {
    res.sendStatus(400);
    console.log("Missing required fields.");
    return;
  }
  // Try block is important if we want to avoid crashes and catch errors
  // If server crashes, we have to restart it manually :/
  try {
    //Create a new user in the database
    const result = await prisma.users.create({
      data: {
        username,
        email,
        password,
        first_name,
        last_name,
        preferred_name,
        year
    }});
    console.log('New user is created: ', result);
    // Send a success response
    res.sendStatus(200);
  } catch (error) {
    // If the error is known...
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // If the error is a unique constraint violation... (username exists)
      if (error.code === 'P2002') {
        console.log(
          'There is a unique constraint violation, a new user cannot be created with this username.'
        )
        res.sendStatus(409);
        return
      }
    }
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return
  }
});