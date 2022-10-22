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


// JWT is a library that let us create and verify tokens
// https://www.npmjs.com/package/jsonwebtoken
var jwt = require("jsonwebtoken");

/*
                                             __
                                            /\ \__
   __      ___    ___    ___   __  __    ___\ \ ,_\
 /'__`\   /'___\ /'___\ / __`\/\ \/\ \ /' _ `\ \ \/
/\ \L\.\_/\ \__//\ \__//\ \L\ \ \ \_\ \/\ \/\ \ \ \_
\ \__/.\_\ \____\ \____\ \____/\ \____/\ \_\ \_\ \__\
 \/__/\/_/\/____/\/____/\/___/  \/___/  \/_/\/_/\/__/


*/

export const deleteAccount = async (req: any, res: any) => {
  const token = req.headers["authorization"]?.slice(7);

  console.log(token);

  let username = "";

  if (!token) {
    return res.status(401).send({ auth: false, message: "No token provided." });
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
    const result = await prisma.users.delete({
      where: {
        username: username,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};
