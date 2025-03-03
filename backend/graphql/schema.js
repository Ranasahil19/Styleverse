const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Order {
    _id: ID!
    totalPrice: Float!
    createdAt: String!
    sellerId: ID!
  }

  type Query {
    totalOrders: Int
    totalRevenue: Float
    sellers: [Seller]
  }

  type Seller {
    _id: ID!
    name: String!
    orders: [Order]
    totalSales: Float!
  }
`;

module.exports = typeDefs;
