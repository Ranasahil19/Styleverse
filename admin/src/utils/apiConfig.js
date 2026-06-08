export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050"
).replace(/\/+$/, "");

export const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
