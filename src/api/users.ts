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


 __  __    ____     __   _ __   ____
/\ \/\ \  /',__\  /'__`\/\`'__\/',__\
\ \ \_\ \/\__, `\/\  __/\ \ \//\__, `\
 \ \____/\/\____/\ \____\\ \_\\/\____/
  \/___/  \/___/  \/____/ \/_/ \/___/


*/

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
  
// //Shanon's work in progress for deleting users:
// // Delete a specific user if user is authenticated + user is the same as the user being deleted
// export const deleteUser = async (req: any, res: any) => {
//   const username = req.query.username;
//   console.log("Attempting to delete user: ", username);
//   const deletedUser = await prisma.users.delete({
//     where: {
//       username: String(username),
//     },
//   })
//   console.log("User deleted. Sending the response back.");
//   res.json(deletedUser);
// };
