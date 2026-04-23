import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_API_URL || 'http://localhost:8000/graphql/',
});

const authLink = new SetContextLink((prevContext, operation) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `JWT ${token}` : '',
    },
  };
});

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  // Check if it's a GraphQL error with an errors array
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) => {
      if (process.env.REACT_APP_ENV === 'development') {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      }
      // Handle authentication errors
      if (message.includes('not authenticated') || message.includes('permission')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });
  } else {
    // Network or other error
    if (process.env.REACT_APP_ENV === 'development') {
      console.error(`[Network error]: ${error}`);
    }
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
