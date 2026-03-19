const { Op } = require("sequelize");
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

    items: async (_, args) => {
      const itemConditions = {};
      const orderConditions = {};

      if (args.search) {
        itemConditions.product_name = {
          [Op.like]: `%${args.search}%`,
        };
      }

      if (args.orderStatus) {
        orderConditions.status = args.orderStatus;
      }

      return await db.Item.findAll({
        where: itemConditions,
        include: [
          {
            model: db.Order,
            as: "order",
            where:
              Object.keys(orderConditions).length > 0
                ? orderConditions
                : undefined,
            include: [
              {
                model: db.Customer,
                as: "customer",
              },
            ],
          },
        ],
      });
    },
  },

  Customer: {
    totalOrdersCount: async (parent) => {
      return await db.Order.count({
        where: { customer_id: parent.id },
      });
    },

    lifetimeValueSpent: async (parent) => {
      const completedOrders = await db.Order.findAll({
        where: {
          customer_id: parent.id,
          status: "Completed",
        },
        include: [{ model: db.Item, as: "items" }],
      });

      let lifetimeValue = 0;

      for (const order of completedOrders) {
        const itemsTotal = order.items.reduce((sum, item) => {
          return sum + item.estimated_price * item.quantity;
        }, 0);

        lifetimeValue += itemsTotal + order.service_fee;
      }

      return lifetimeValue;
    },

    orders: async (parent) => {
      return await db.Order.findAll({
        where: { customer_id: parent.id },
        include: [{ model: db.Item, as: "items" }],
      });
    },
  },
};

module.exports = resolvers;
