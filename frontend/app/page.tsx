"use client";

import { Button, Typography, Space } from "antd";

const { Title, Text } = Typography;

export default function Home() {
  return (
    <main className="min-h-screen p-10 flex flex-col items-center justify-center bg-gray-50">
      <Space orientation="vertical" align="center" size="large">
        <Title level={2}>Jastip Operations</Title>
        <Text type="secondary">
          Frontend successfully bootstrapped and wired.
        </Text>

        <Space>
          <Button type="primary" size="large">
            Primary Action
          </Button>
          <Button size="large">Secondary Action</Button>
        </Space>
      </Space>
    </main>
  );
}
