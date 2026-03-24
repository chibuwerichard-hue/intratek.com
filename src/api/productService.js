import api from './axiosConfig';

// Fetch all products
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Add a new product
export const addProduct = async (product) => {
  const response = await api.post('/products', product);
  return response.data;
};

// Delete a product
export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};