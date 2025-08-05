import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: ''
  });

  const [merchantDetails, setMerchantDetails] = useState({
    shop_name: '',
    gstin: '',
    shop_address: ''
  });

  const [userId, setUserId] = useState(null);
  const [approvedLoans, setApprovedLoans] = useState(0);
  const [referredLoans, setReferredLoans] = useState(0);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProducts();
      fetchMerchantDetails();
      fetchLoanStats();
    }
  }, [userId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    if (error) console.error('Error fetching products:', error.message);
    else setProducts(data);
  };

  const fetchMerchantDetails = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('shop_name, gstin, shop_address')
      .eq('id', userId)
      .single();

    if (data) setMerchantDetails(data);
    if (error) console.error('Error fetching merchant details:', error.message);
  };

  const fetchLoanStats = async () => {
    const { count: referredCount } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId);

    const { count: approvedCount } = await supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId)
      .eq('status', 'approved');

    setReferredLoans(referredCount || 0);
    setApprovedLoans(approvedCount || 0);
  };

  const updateMerchantDetails = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update(merchantDetails)
      .eq('id', userId);

    if (error) alert("Failed to update merchant details");
    else alert("Merchant details updated");
  };

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleMerchantChange = (e) => {
    setMerchantDetails({ ...merchantDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (error) console.error('Error deleting product:', error.message);
    else setProducts(products.filter((p) => p.product_id !== productId));
  };

  return (
    <div className="products-container">
      <h2 className="title">📊 Overview</h2>
      <div className="dashboard-summary">
        <div className="summary-card referred">
          <h3>Total Loans Referred</h3>
          <p>{referredLoans}</p>
        </div>
        <div className="summary-card approved">
          <h3>Total Approved Loans</h3>
          <p>{approvedLoans}</p>
        </div>
      </div>

      <h2 className="title">🛍️ Product & Merchant Details</h2>

      <div className="form-section-wrapper">
        {/* Add Product Form */}
        <form onSubmit={handleSubmit} className="product-form">
          <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleChange} required />
          <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleChange} required />
          <input type="number" name="price" placeholder="Price (₹)" value={newProduct.price} onChange={handleChange} required />
          <button type="submit">➕ Add Product</button>
        </form>

        {/* Merchant Form */}
        <form className="merchant-form" onSubmit={(e) => { e.preventDefault(); updateMerchantDetails(); }}>
          <input type="text" name="shop_name" placeholder="Shop Name" value={merchantDetails.shop_name} onChange={handleMerchantChange} required />
          <input type="text" name="gstin" placeholder="GSTIN Number" value={merchantDetails.gstin} onChange={handleMerchantChange} required />
          <input type="text" name="shop_address" placeholder="Shop Address" value={merchantDetails.shop_address} onChange={handleMerchantChange} required />
          <button type="submit">💾 Save Merchant Info</button>
        </form>
      </div>

      <h2 className="subtitle">📦 Available Products</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price (₹)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((prod, index) => (
              <tr key={prod.product_id}>
                <td>{index + 1}</td>
                <td>{prod.name}</td>
                <td>{prod.description}</td>
                <td>₹{prod.price}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(prod.product_id)}>🗑 Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="no-data">No products added yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
