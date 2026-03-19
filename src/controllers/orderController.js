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

exports.getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    const conditions = {};

    if (status) {
      conditions.status = status;
    }

    const orders = await Order.findAll({
      where: conditions,
      include: [
        {
          model: db.Customer,
          as: "customer",
          attributes: ["id", "name"],
        },
        {
          model: db.Item,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]], // shows newest orders at the top
    });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // validate that the user actually provided a status in the body
    if (!status) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a new status for the order.",
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "No order found with that UUID",
      });
    }

    // execute the update
    order.status = status;
    await order.save();

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        status: "fail",
        message: `Invalid status. ${error.errors[0].message}`,
      });
    }

    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // fetch order and eagerly load the relational graph
    const order = await Order.findByPk(id, {
      include: [
        {
          model: db.Customer,
          as: "customer",
          attributes: ["id", "name", "phone"],
        },
        {
          model: db.Item,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "No order found with that UUID",
      });
    }

    // ===========================
    // calculating invoice
    // ===========================

    const orderData = order.toJSON(); // convert Sequelize instance into plain JSON

    // calculate sum of (price * quantity) for all items in the order
    const itemsTotal = orderData.items.reduce((sum, item) => {
      return sum + item.estimated_price * item.quantity;
    }, 0);

    // calculate final bill
    const grandTotal = itemsTotal + orderData.service_fee;

    // attach computed invoice data to the response payload
    orderData.invoice = {
      subtotal_items: itemsTotal,
      service_fee: orderData.service_fee,
      grand_total: grandTotal,
    };

    res.status(200).json({
      status: "success",
      data: {
        order: orderData,
      },
    });
  } catch (error) {
    next(error);
  }
};
