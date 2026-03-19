const express = require("express");
const itemController = require("../controllers/itemController.js");

const router = express.Router();

router.post("/", itemController.createItem);

module.exports = router;
