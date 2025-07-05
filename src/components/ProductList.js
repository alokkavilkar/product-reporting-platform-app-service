import { Link } from 'react-router';
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import './ProductList.css';

function ProductList() {
  const { getAccessTokenSilently } = useAuth0();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const api = createApi({ getAccessTokenSilently });
    api.fetchProducts()
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('🚨 Internal Server Error — Unable to load products.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader" aria-label="Loading products"></div>;
  if (error) return (
    <div className="error-box">
      <h2>500 - Internal Server Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'inspected': return 'status-inspected';
      case 'resolved': return 'status-resolved';
      case 'faulty': return 'status-faulty';
      default: return '';
    }
  };

  return (
    <div className="product-list">
      <h2>Products</h2>
      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No products found.</p>
      ) : (
        <ul className="product-grid">
          {products.map(p => (
            <li key={p.id} className="product-card">
              <div className="product-content">
                <Link to={`/inspect/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-name">{p.name}</div>
                  <div className="product-type">Type: {p.type}</div>
                </Link>
              </div>
              <div className={`status-badge ${getStatusClass(p.status)}`}>
                {p.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductList;
