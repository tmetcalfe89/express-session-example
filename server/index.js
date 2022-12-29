require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const userModel = require("./models/user");

const {
  PORT = 3001,
  MONGODB_URI = "mongodb://0.0.0.0:27017/test",
  SESSION_SECRET = "keyboard cat",
} = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
    }),
  })
);

/**
 * POST /user/register
 * body: { username, password }
 *
 * Creates a new user entry.
 * Adds new user entry's ID to req.session under userId.
 * Responds with 201 status code on success.
 * Responds with 500 status code on unknown failure.
 */
app.post("/user/register", async (req, res) => {
  try {
    const newUser = await userModel.create(req.body);

    req.session.userId = newUser._id;
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
});

/**
 * POST /user/login
 * body: { username, password }
 *
 * Checks for an existing user entry.
 * Adds existing user entry's ID to req.session under userId.
 * Responds with 200 status code on success.
 * Responds with 400 status code on invalid credentials.
 * Responds with 500 status code on unknown error.
 */
app.post("/user/login", async (req, res) => {
  try {
    const existingUser = await userModel.findOne(req.body);

    if (!existingUser) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    req.session.userId = existingUser._id;
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging user in" });
  }
});

/**
 * GET /user
 *
 * Matches userId on req.session against database.
 * Responds with username property on success.
 * Responds with 403 on missing userId on req.session.
 * Responds with 404 on invalid userId on req.session.
 * Responds with 500 on unknown failure.
 */
app.get("/user", async (req, res) => {
  try {
    const { userId } = req.session;
    if (!userId) {
      res.sendStatus(403);
      return;
    }

    const matchingUser = await userModel.findById(userId);
    if (!matchingUser) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json({
      username: matchingUser.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging user in" });
  }
});

/**
 * Deletes userId from req.session, effectively logging the user out.
 */
app.delete("/user", (req, res) => {
  req.session.userId = undefined;
  res.sendStatus(200);
});

mongoose.connect(MONGODB_URI).then(() => console.log("Connected to database"));

app.listen(PORT, () => console.info(`Listening on port ${PORT}`));
