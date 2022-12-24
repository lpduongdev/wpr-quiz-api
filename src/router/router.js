module.exports = (app) => {
  const attempts = require("../controller/attempt_controller");
  const router = require("express").Router();

  router.post("/attempts", attempts.attempt);

  router.post("/attempts/:id/submit", attempts.submit);

  app.use(router);
};
