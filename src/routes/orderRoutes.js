const express = require("express");
const orderController = require("../controllers/orderController.js");

const router = express.Router();

router.post("/", orderController.createOrder);

module.exports = router;
