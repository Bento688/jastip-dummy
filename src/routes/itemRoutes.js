const express = require("express");
const itemController = require("../controllers/itemController.js");

const router = express.Router();

router.post("/", itemController.createItem);
router.patch("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

module.exports = router;
