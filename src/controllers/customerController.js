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
