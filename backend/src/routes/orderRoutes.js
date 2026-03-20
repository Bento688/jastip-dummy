const express = require("express");
const orderController = require("../controllers/orderController.js");

const router = express.Router();

router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrder);
router.patch("/:id/status", orderController.updateOrderStatus);

module.exports = router;
