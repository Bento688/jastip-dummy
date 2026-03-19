const gql = String.raw;

const typeDefs = gql`
  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: String!
    # A customer can have an array of orders
    orders: [Order!]

    totalOrdersCount: Int!
    lifetimeValueSpent: Int!
  }

  type Order {
    id: ID!
    status: String!
    pickup_location: String!
    service_fee: Int!
    customer: Customer!
    items: [Item!]
  }

  type Item {
    id: ID!
    product_name: String!
    target_url: String
    estimated_price: Int!
    quantity: Int!
    order: Order!
  }

  type Query {
    # Get all customers
    customers: [Customer!]!

    # The Shopper's Dashboard: Get orders, optionally filtered by status
    orders(status: String): [Order!]!

    items(search: String, orderStatus: String): [Item!]!
  }
`;

module.exports = typeDefs;
