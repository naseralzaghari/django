/**
 * Centralized API configuration
 * Uses environment variables with fallback to localhost
 */
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/graphql/';

// Export base URL without /graphql for other endpoints if needed
export const BASE_URL = API_URL.replace('/graphql/', '');

/**
 * Utility to perform GraphQL mutations with file uploads
 * @param query - GraphQL mutation string
 * @param variables - Mutation variables
 * @param files - Object mapping variable names to File objects (e.g., { pdf_file: File })
 * @returns Promise with the GraphQL response
 */
export const graphqlFileUpload = async (
  query: string,
  variables: Record<string, any>,
  files: Record<string, File>
): Promise<any> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  // Append the GraphQL query
  formData.append('query', query);

  // Append variables as JSON
  formData.append('variables', JSON.stringify(variables));

  // Append all files
  Object.entries(files).forEach(([key, file]) => {
    formData.append(key, file);
  });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': token ? `JWT ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
