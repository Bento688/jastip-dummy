const db = require("../models");
const Customer = db.Customer;

exports.createCustomer = async (req, res, next) => {
  try {
    // 1. extract data from the incoming request body
    const { name, email, phone } = req.body;

    // 2. (insert into mysql)
    const newCustomer = await Customer.create({
      name,
      email,
      phone,
    });

    // 3. return the value
    res.status(201).json({
      status: "success",
      data: {
        customer: newCustomer,
      },
    });
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        status: "fail",
        message: error.errors[0].message,
      });
    }

    next(error);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: db.Order,
          as: "orders",
          include: [
            {
              model: db.Item,
              as: "items",
            },
          ],
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({
        status: "fail",
        message: "No customer found with that UUID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};
