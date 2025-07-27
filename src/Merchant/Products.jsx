import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProducts();
    }
  }, [userId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId); // Only fetch user's products

    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data);
    }
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    const productData = {
      ...newProduct,
      user_id: userId,
      price: parseFloat(newProduct.price)
    };

    const { data, error } = await supabase.from('products').insert([productData]);

    if (error) {
      console.error('Error adding product:', error.message);
      alert('Error adding product.');
    } else {
      setProducts([...products, data[0]]);
      setNewProduct({ name: '', description: '', price: '' });
    }
  };

  const handleDelete = async (productId) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      console.error('Error deleting product:', error.message);
    } else {
      setProducts(products.filter((p) => p.product_id !== productId));
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">🛍️ Add New Product</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleChange}
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleChange}
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={newProduct.price}
          onChange={handleChange}
          className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          ➕ Add Product
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-gray-700">📦 Available Products</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-lg shadow">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="px-6 py-3 border text-left">#</th>
              <th className="px-6 py-3 border text-left">Name</th>
              <th className="px-6 py-3 border text-left">Description</th>
              <th className="px-6 py-3 border text-left">Price (₹)</th>
              <th className="px-6 py-3 border text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {products.map((prod, index) => (
              <tr key={prod.product_id} className="hover:bg-gray-100 transition">
                <td className="px-6 py-4 border">{index + 1}</td>
                <td className="px-6 py-4 border">{prod.name}</td>
                <td className="px-6 py-4 border">{prod.description}</td>
                <td className="px-6 py-4 border">₹{prod.price}</td>
                <td className="px-6 py-4 border">
                  <button
                    onClick={() => handleDelete(prod.product_id)}
                    className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No products added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
