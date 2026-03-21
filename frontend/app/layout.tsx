import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ApolloWrapper } from "@/lib/apollo-provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jastip Operations Dashboard",
  description: "Internal Dashboard for managing Jastip orders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          <ApolloWrapper>{children}</ApolloWrapper>
        </AntdRegistry>
      </body>
    </html>
  );
}
