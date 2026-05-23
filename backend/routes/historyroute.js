const express = require("express");
const { getHistory, saveSession } = require("../controller/historycontroller");
const { authenticateToken } = require("../middleware/auth");

const historyRouter = express.Router();

historyRouter.get("/", authenticateToken, getHistory);
historyRouter.post("/", authenticateToken, saveSession);

module.exports = historyRouter;
