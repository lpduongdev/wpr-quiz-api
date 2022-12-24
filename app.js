const express = require("express");
const app = express();
const db_config = require("./src/config/db_config");
const activateRouter = require("./src/router/router");
const { MongoClient } = require("mongodb");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const startServer = async () => {
  const client = await MongoClient.connect(db_config.url);
  const db = client.db();
  const setDB = (req, res, next) => {
    req.db = db;
    next();
  };
  app.use(setDB);
  activateRouter(app);
  await app.listen(3000);
};
startServer();
