import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { GRAPHQL_URL } from "../../../../utils/apiConfig";

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});

export default client;
