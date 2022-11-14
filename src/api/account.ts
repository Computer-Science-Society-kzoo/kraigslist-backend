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
import { userIsLoggedIn, verifyTokenAndReturnAccount } from "./auth";

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
  //const token = req.headers["authorization"]?.slice(7);
  const token = req.cookies.auth

  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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

//get username based on token
export const getUsername = async (req: any, res: any) => {
  //const token = req.headers["authorization"]?.slice(7);

  const token = req.cookies.auth
  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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
    const result = await prisma.users.findUnique({
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


//change user name
export const changeUsername = async (req: any, res: any) => {
  //const token = req.headers["authorization"]?.slice(7);

  const token = req.cookies.auth
  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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
    const result = await prisma.users.update({
      where: {
        username: username,
      },
      data: {
        username: req.body.username,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};

//change user password
export const changePassword = async (req: any, res: any) => {
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
    const result = await prisma.users.update({
      where: {
        username: username,
      },
      data: {
        password: req.body.password,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};

//change user email
export const changeEmail = async (req: any, res: any) => {
  //const token = req.headers["authorization"]?.slice(7);
  const token = req.cookies.auth

  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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
    const result = await prisma.users.update({
      where: {
        username: username,
      },
      data: {
        email: req.body.email,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};

//change name
export const changeFirstName = async (req: any, res: any) => {
  //const token = req.headers["authorization"]?.slice(7);

  const token = req.cookies.auth
  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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
    const result = await prisma.users.update({
      where: {
        username: username,
      },
      data: {
        first_name: req.body.firstname,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};

//change surname
export const changeSurname = async (req: any, res: any) => {
  //const token = req.headers["authorization"]?.slice(7);
  const token = req.cookies.auth
  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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
    const result = await prisma.users.update({
      where: {
        username: username,
      },
      data: {
        last_name: req.body.lastname,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};

//change year
export const changeYear = async (req: any, res: any) => {
  //const token = req.headers["authorization"]?.slice(7);
  const token = req.cookies.auth
  console.log(token);

  let username = "";

  try {
    if (token === undefined) {
      res.status(401).send("No token provided: " + token);
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
    const result = await prisma.users.update({
      where: {
        username: username,
      },
      data: {
        year: req.body.year,
      },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Unknown error:" + error);
    res.sendStatus(500);
    return;
  }
};

