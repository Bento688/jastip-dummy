const express = require("express");
const customerController = require("../controllers/customerController.js");

const router = express.Router();

router.post("/", customerController.createCustomer);
router.get("/:id", customerController.getCustomer);

module.exports = router;
