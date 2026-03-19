"use strict";

const crypto = require("crypto");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // ==========================================
    // 1. Generate Customers
    // ==========================================
    const rawCustomers = [
      {
        name: "Alice Wonderland",
        email: "alice@example.com",
        phone: "0911111111",
      },
      { name: "Bob Builder", email: "bob@example.com", phone: "0922222222" },
      {
        name: "Charlie Chaplin",
        email: "charlie@example.com",
        phone: "0933333333",
      },
      { name: "Diana Prince", email: "diana@example.com", phone: "0944444444" },
      { name: "Ethan Hunt", email: "ethan@example.com", phone: "0955555555" },
      {
        name: "Fiona Gallagher",
        email: "fiona@example.com",
        phone: "0966666666",
      },
      {
        name: "George Costanza",
        email: "george@example.com",
        phone: "0977777777",
      },
      { name: "Harry Potter", email: "harry@example.com", phone: "0988888888" },
      { name: "Ivy Pepper", email: "ivy@example.com", phone: "0999999999" },
      { name: "Jack Sparrow", email: "jack@example.com", phone: "0900000000" },
    ];

    // Map over the raw data to inject UUIDs and Timestamps
    const customers = rawCustomers.map((c) => ({
      id: crypto.randomUUID(),
      ...c,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Customers", customers);

    // ==========================================
    // 2. Generate Orders
    // ==========================================
    const rawOrders = [
      {
        customer_id: customers[0].id,
        status: "Pending",
        pickup_location: "Taipei Main",
        service_fee: 150,
      },
      {
        customer_id: customers[0].id,
        status: "Completed",
        pickup_location: "Tamsui",
        service_fee: 300,
      }, // Alice has 2 orders
      {
        customer_id: customers[1].id,
        status: "Purchased",
        pickup_location: "Home Delivery",
        service_fee: 200,
      },
      {
        customer_id: customers[2].id,
        status: "Shipped",
        pickup_location: "Tamsui",
        service_fee: 100,
      },
      {
        customer_id: customers[3].id,
        status: "Pending",
        pickup_location: "Taipei Main",
        service_fee: 150,
      },
      {
        customer_id: customers[4].id,
        status: "Ready for Pickup",
        pickup_location: "Tamsui",
        service_fee: 250,
      },
      {
        customer_id: customers[5].id,
        status: "Pending",
        pickup_location: "Home Delivery",
        service_fee: 400,
      },
      {
        customer_id: customers[6].id,
        status: "Completed",
        pickup_location: "Taipei Main",
        service_fee: 100,
      },
      {
        customer_id: customers[7].id,
        status: "Purchased",
        pickup_location: "Tamsui",
        service_fee: 150,
      },
      {
        customer_id: customers[8].id,
        status: "Shipped",
        pickup_location: "Home Delivery",
        service_fee: 200,
      },
      // Jack Sparrow (customers[9]) has NO orders yet. Good for testing empty states.
    ];

    const orders = rawOrders.map((o) => ({
      id: crypto.randomUUID(),
      ...o,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Orders", orders);

    // ==========================================
    // 3. Generate Items
    // ==========================================
    const rawItems = [
      // Alice's Pending Order (orders[0])
      {
        order_id: orders[0].id,
        product_name: "Uniqlo U T-Shirt",
        estimated_price: 390,
        quantity: 2,
      },
      {
        order_id: orders[0].id,
        product_name: "MUJI Notebook",
        estimated_price: 150,
        quantity: 3,
      },

      // Alice's Completed Order (orders[1])
      {
        order_id: orders[1].id,
        product_name: "Nintendo Switch Game",
        estimated_price: 1500,
        quantity: 1,
      },

      // Bob's Order (orders[2])
      {
        order_id: orders[2].id,
        product_name: "HHKB Keyboard",
        estimated_price: 10500,
        quantity: 1,
      },

      // Charlie's Order (orders[3])
      {
        order_id: orders[3].id,
        product_name: "Tokyo Banana Snack",
        estimated_price: 450,
        quantity: 4,
      },

      // Diana's Order (orders[4])
      {
        order_id: orders[4].id,
        product_name: "Shiseido Sunscreen",
        estimated_price: 850,
        quantity: 2,
      },
      {
        order_id: orders[4].id,
        product_name: "Matcha Powder",
        estimated_price: 300,
        quantity: 1,
      },

      // Ethan's Order (orders[5])
      {
        order_id: orders[5].id,
        product_name: "Sony Headphones",
        estimated_price: 8900,
        quantity: 1,
      },

      // Fiona's Order (orders[6])
      {
        order_id: orders[6].id,
        product_name: "Dyson Airwrap",
        estimated_price: 14500,
        quantity: 1,
      },

      // George's Order (orders[7])
      {
        order_id: orders[7].id,
        product_name: "G-Shock Watch",
        estimated_price: 3200,
        quantity: 1,
      },

      // Harry's Order (orders[8])
      {
        order_id: orders[8].id,
        product_name: "Universal Studios Wand",
        estimated_price: 1200,
        quantity: 1,
      },
      {
        order_id: orders[8].id,
        product_name: "Butterbeer Mugs",
        estimated_price: 600,
        quantity: 2,
      },

      // Ivy's Order (orders[9])
      {
        order_id: orders[9].id,
        product_name: "Le Labo Perfume",
        estimated_price: 6500,
        quantity: 1,
      },
    ];

    const items = rawItems.map((i) => ({
      id: crypto.randomUUID(),
      ...i,
      target_url: "https://example.com/product", // Generic URL for all to save space
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Items", items);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Items", null, {});
    await queryInterface.bulkDelete("Orders", null, {});
    await queryInterface.bulkDelete("Customers", null, {});
  },
};
