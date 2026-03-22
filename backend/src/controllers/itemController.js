const db = require("../models");
const Item = db.Item;

exports.createItem = async (req, res, next) => {
  try {
    // extract required foreign key and item details
    const { order_id, product_name, target_url, estimated_price, quantity } =
      req.body;

    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (
      !order_id ||
      typeof order_id !== "string" ||
      !uuidV4Regex.test(order_id)
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid order_id format. Must be a UUID v4 string.",
      });
    }

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

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { product_name, target_url, estimated_price, quantity } = req.body;

    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "No item found with that UUID",
      });
    }

    // sequelize will only change the fields that actually changed.
    // it will ignore "undefined" values
    await item.update({
      product_name,
      target_url,
      estimated_price,
      quantity,
    });

    res.status(200).json({
      status: "success",
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Item.destroy returns the number of rows deleted in the DB
    const deletedRowCount = await Item.destroy({
      where: { id },
    });

    if (deletedRowCount === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No item found with that UUID to delete",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
