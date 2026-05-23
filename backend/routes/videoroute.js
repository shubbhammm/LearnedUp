const express = require("express");
const transcriptFetcher = require("../controller/videotranscript");

const videorouter = express.Router();

// Get transcript by videoId in URL
videorouter.get("/transcript/:videoId", transcriptFetcher);

// OR Get transcript by sending videoId in body
videorouter.post("/transcript", transcriptFetcher);

module.exports = videorouter;
