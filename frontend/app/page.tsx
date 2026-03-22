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
  Tabs,
  message,
  Space,
} from "antd";
import NewOrderDrawer from "@/components/NewOrderDrawer";

import axiosInstance from "../lib/axios";

const { Title } = Typography;

// ======================
// GraphQL Query
// ======================

const GET_ORDERS_BY_STATUS = gql`
  query OrdersByStatus($status: String!) {
    orders(status: $status) {
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
  status: OrderStatus;
  pickup_location: string;
  customer: {
    name: string;
    phone: string;
  };
  items: Item[];
}

interface GetOrdersResponse {
  orders: Order[];
}

const ORDER_STATUSES = [
  "Pending",
  "Purchased",
  "Shipped",
  "Ready for Pickup",
  "Completed",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];
type DashboardTabStatus = OrderStatus;

interface GetOrdersVariables {
  status: DashboardTabStatus;
}

export default function FulfillmentDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTabStatus>("Pending"); // default to "pending"

  const tabItems = ORDER_STATUSES.map((status) => ({
    key: status,
    label: status,
  }));

  // execute query
  const { loading, error, data, refetch } = useQuery<
    GetOrdersResponse,
    GetOrdersVariables
  >(GET_ORDERS_BY_STATUS, {
    variables: { status: activeTab },
    notifyOnNetworkStatusChange: true,
  });

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleMarkPurchased = async (orderId: string) => {
    try {
      setUpdatingId(orderId);

      await axiosInstance.patch(`/orders/${orderId}/status`, {
        status: "Purchased",
      });

      message.success("Order marked as Purchased!");

      // Apollo re-fetches the fresh list of Pending Orders
      await refetch();
    } catch (error) {
      console.error(error);
      message.error("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTabChange = (key: string) => {
    if (ORDER_STATUSES.includes(key as OrderStatus)) {
      setActiveTab(key as DashboardTabStatus);
    }
  };

  const handleOpenInvoice = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsInvoiceOpen(true);
  };

  const handleCloseInvoice = () => {
    setSelectedOrderId(null);
    setIsInvoiceOpen(true);
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

  // columns for the main table
  const columns: TableColumnsType<Order> = [
    { title: "Customer", dataIndex: ["customer", "name"], key: "name" },
    { title: "Phone", dataIndex: ["customer", "phone"], key: "phone" },
    { title: "Pickup Location", dataIndex: "pickup_location", key: "location" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatus) => <Tag color="processing">{status}</Tag>,
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          {activeTab === "Pending" && (
            <Button
              type="primary"
              loading={updatingId === record.id}
              onClick={() => handleMarkPurchased(record.id)}
            >
              Mark Purchased
            </Button>
          )}

          <Button onClick={() => handleOpenInvoice(record.id)}>Invoice</Button>
        </Space>
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

  // ======================
  // MAIN COMPONENT
  // ======================
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      {isInvoiceOpen && selectedOrderId && (
        <Alert
          type="info"
          showIcon
          description={`Invoice placeholder for order ${selectedOrderId}`}
          closable
          onClose={handleCloseInvoice}
        />
      )}
      <Card
        title={
          <Title level={2} className="m-0">
            Store Fulfillment Board
          </Title>
        }
        extra={
          <Button type="primary" onClick={() => setIsDrawerOpen(true)}>
            + New Order
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />
        <Table
          rowKey="id"
          columns={columns}
          expandable={{ expandedRowRender }}
          dataSource={data?.orders ?? []}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <NewOrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => refetch()}
      />
    </main>
  );
}
