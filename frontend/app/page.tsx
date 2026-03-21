"use client";

import React, { useState } from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import {
  Table,
  Typography,
  Tag,
  Spin,
  Alert,
  Card,
  Button,
  TableColumnsType,
  message,
} from "antd";

import axiosInstance from "../lib/axios";

const { Title } = Typography;

// ======================
// GraphQL Query
// ======================

const GET_PENDING_ORDERS = gql`
  query ShoppersDashBoard {
    orders(status: "Pending") {
      id
      status
      pickup_location
      customer {
        name
        phone
      }
      items {
        id
        product_name
        estimated_price
        quantity
      }
    }
  }
`;

// ==========================================
// TypeScript interfaces for GraphQL data
// ==========================================
interface Item {
  id: string;
  product_name: string;
  estimated_price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  pickup_location: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Item[];
}

export default function FulfillmentDashboard() {
  // execute query
  const { loading, error, data, refetch } = useQuery(GET_PENDING_ORDERS);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleMarkPurchased = async (orderId: string) => {
    try {
      setUpdatingId(orderId);

      await axiosInstance.patch(`/orders/${orderId}/status`, {
        status: "Purchased",
      });

      message.success("Order marked as Purchased!");

      // Apollo re-fetches the fresh list of Pending Orders
      await refetch();
    } catch (error: any) {
      console.error(error);
      message.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ======================
  // ERROR & LOADING STATES
  // ======================
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Spin size="large" description="Loading active orders..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-10">
        <Alert
          title="Error fetching orders"
          description={error.message}
          type="error"
          showIcon
        />
      </div>
    );
  }

  // create a unique 'key' for every row
  const tableData = data?.orders.map((order: Order) => ({
    ...order,
    key: order.id,
  }));

  // columns for the main table
  const columns: TableColumnsType<Order> = [
    { title: "Customer", dataIndex: ["customer", "name"], key: "name" },
    { title: "Phone", dataIndex: ["customer", "phone"], key: "phone" },
    { title: "Pickup Location", dataIndex: "pickup_location", key: "location" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color="processing">{status}</Tag>,
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          loading={updatingId === record.id}
          onClick={() => handleMarkPurchased(record.id)}
        >
          Mark Purchased
        </Button>
      ),
    },
  ];

  // define nested render
  const expandedRowRender = (order: Order) => {
    const itemColumns = [
      { title: "Product Name", dataIndex: "product_name", key: "product_name" },
      { title: "Quantity", dataIndex: "quantity", key: "quantity" },
      {
        title: "Estimated Price",
        dataIndex: "estimated_price",
        key: "estimated_price",
        render: (price: number) => `NT$ ${price.toLocaleString()}`,
      },
    ];

    const itemsWithKeys = order.items.map((item) => ({
      ...item,
      key: item.id,
    }));

    return (
      <Table
        columns={itemColumns}
        dataSource={itemsWithKeys}
        pagination={false}
        size="small"
        bordered
      />
    );
  };
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <Card>
        <Title level={2} className="mb-6">
          Store Fulfillment Board
        </Title>
        <Table
          columns={columns}
          expandable={{ expandedRowRender }}
          dataSource={tableData}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </main>
  );
}
