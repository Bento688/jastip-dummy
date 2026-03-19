const db = require("../models");
const Item = db.Item;

exports.createItem = async (req, res, next) => {
  try {
    // extract required foreign key and item details
    const { order_id, product_name, target_url, estimated_price, quantity } =
      req.body;

    const newItem = await Item.create({
      order_id,
      product_name,
      target_url,
      estimated_price,
      quantity,
    });

    res.status(201).json({
      status: "success",
      data: {
        item: newItem,
      },
    });
  } catch (error) {
    // handle foreign key failures
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid order_id. Order does not exist in the DB.",
      });
    }

    // handle validation failures (e.g. missing product_name)
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        status: "fail",
        message: error.errors.map((e) => e.message).join(", "),
      });
    }

    next(error);
  }
};
