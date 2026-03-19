const db = require("../models");

const resolvers = {
  Query: {
    customers: async () => {
      return await db.Customer.findAll();
    },

    orders: async (_, args) => {
      const conditions = {};

      if (args.status) {
        conditions.status = args.status;
      }

      return await db.Order.findAll({
        where: conditions,
        include: [
          { model: db.Customer, as: "customer" },
          { model: db.Item, as: "items" },
        ],
        order: [["createdAt", "DESC"]],
      });
    },
  },
};

module.exports = resolvers;
