const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const usersRouter = require("./routes/users");
const authenticationRouter = require("./routes/authentication");
const tokenChecker = require("./middleware/tokenChecker");
const geminiRouter = require("./routes/gemini");
const apodRouter = require("./routes/apod");
const favouritesRouter = require("./routes/favourites");
const issRouter = require("./routes/iss");

const app = express();

// Allow requests from any client
// docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
// docs: https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());

// Parse JSON request bodies, made available on `req.body`
app.use(bodyParser.json());

// API Routes
app.use("/users", usersRouter);
app.use("/tokens", authenticationRouter);
app.use("/api/ai", geminiRouter);
app.use("/apod", apodRouter);
app.use("/favourites", tokenChecker, favouritesRouter);
app.use("/iss", issRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ err: "Error 404: Not Found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    res.status(500).send(err.message);
  } else {
    res.status(500).json({ err: "Houston, we have a problem" });
  }
});

module.exports = app;
