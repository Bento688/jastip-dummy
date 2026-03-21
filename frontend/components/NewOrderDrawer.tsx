"use client";

import React, { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Select,
  InputNumber,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import axiosInstance from "@/lib/axios";

// gql query to fetch customers for the dropdown
const GET_CUSTOMERS = gql`
  query GetCustomersForDropdown {
    customers {
      id
      name
    }
  }
`;

interface GetCustomersResponse {
  customers: {
    id: string;
    name: string;
  }[];
}

interface NewOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface NewOrderFormValues {
  customer_id: string;
  pickup_location: string;
  items: {
    product_name: string;
    estimated_price: number;
    quantity: number;
  }[];
}

export default function NewOrderDrawer({
  isOpen,
  onClose,
  onSuccess,
}: NewOrderDrawerProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loading: loadingCustomers, data: customerData } =
    useQuery<GetCustomersResponse>(GET_CUSTOMERS);

  const handleSubmit = async (values: NewOrderFormValues) => {
    try {
      setIsSubmitting(true);

      // NGACO INI KEKNYA NANTI CEK LAGI
      await axiosInstance.post("/orders", {
        customer_id: values.customer_id,
        pickup_location: values.pickup_location,
        items: values.items,
      });

      message.success("Order created successfully!");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Failed to create the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      title="Create New Order"
      size="default"
      onClose={onClose}
      open={isOpen}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          items: [{ product_name: "", estimated_price: null, quantity: 1 }],
        }}
      >
        <Form.Item
          name="customer_id"
          label="Customer"
          rules={[
            {
              required: true,
              message: "Please select a customer",
            },
          ]}
        >
          <Select
            placeholder="Select a customer"
            loading={loadingCustomers}
            options={customerData?.customers.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="pickup_location"
          label="Pickup Location"
          rules={[
            {
              required: true,
              message: "Please specify a pickup location",
            },
          ]}
        >
          <Input placeholder="e.g., Tamsui Station" />
        </Form.Item>

        <div className="mb-4 text-sm font-semibold border-b pb-2">
          Order Items
        </div>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="bg-gray=50 p-4 rounded-md mb-4 border relative"
                >
                  {/* DELETE BUTTON: Only show if there's more than 1 item */}
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      className="absolute top-2 right-2"
                    />
                  )}

                  <Form.Item
                    {...restField}
                    name={[name, "product_name"]}
                    label="Product Name"
                    rules={[
                      {
                        required: true,
                        message: "Missing product name",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., Uniqlo U T-Shirt" />
                  </Form.Item>

                  <Space className="w-full" size="large">
                    <Form.Item
                      {...restField}
                      name={[name, "estimated_price"]}
                      label="Est. Price (NT$)"
                      rules={[
                        {
                          required: true,
                          message: "Missing price",
                        },
                      ]}
                    >
                      <InputNumber className="w-full" min={0} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      label="Quantity"
                      rules={[
                        {
                          required: true,
                          message: "Missing quantity",
                        },
                      ]}
                    >
                      <InputNumber className="w-full" min={1} />
                    </Form.Item>
                  </Space>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({ quantity: 1 })}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Another Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item className="mt-8">
          <Space className="w-full justify-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Submit Order
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
