const db = require("../models");
const Order = db.Order;

exports.createOrder = async (req, res, next) => {
  try {
    // we only require the absolute minimum data to start an order container
    const { customer_id, pickup_location } = req.body;

    const newOrder = await Order.create({
      customer_id,
      pickup_location,
    });

    res.status(201).json({
      status: "success",
      data: {
        order: newOrder,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid customer_id. Customer does not exist in the DB.",
      });
    }

    next(error);
  }
};
