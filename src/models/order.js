"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // An Order belongs to a single Customer
      Order.belongsTo(models.Customer, {
        foreignKey: "customer_id",
        as: "customer",
      });

      // An Order can have many Items
      Order.hasMany(models.Item, {
        foreignKey: "order_id",
        as: "items",
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
        validate: {
          isIn: [
            [
              "Pending",
              "Purchased",
              "Shipped",
              "Ready for Pickup",
              "Completed",
            ],
          ],
        },
      },
      pickup_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      service_fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Order",
    },
  );

  return Order;
};
