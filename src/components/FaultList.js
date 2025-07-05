import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import { useNavigate } from 'react-router';
import './FaultList.css';

function FaultList() {
  const { getAccessTokenSilently } = useAuth0();
  const api = createApi({ getAccessTokenSilently });
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.fetchProducts()
      .then(res => {
        const filtered = res.data.filter(p => {
          const status = p.status.toLowerCase();
          return status === 'faulty';
        });
        setFaults(filtered);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch faults');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader" aria-label="Loading Faults"></div>;
  if (error) return (
    <div className="error-box">
      <h2>500 - Internal Server Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );
  if (faults.length === 0) return <p style={{ textAlign: 'center' }}>No Faults found.</p>;

  return (
    <div className="fault-list">
      <h2>Faults / Inspected Products</h2>
      <div className="fault-items">
        {faults.map(product => (
          <div
            key={product.id}
            className="fault-card"
            onClick={() => navigate(`/report-fault/${product.id}`)}
          >
            <h3>{product.name}</h3>
            <p><strong>Type:</strong> {product.type}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={
                  product.status.toLowerCase().includes('fail')
                    ? 'status-fail'
                    : 'status-pass'
                }
              >
                {product.status.toUpperCase()}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaultList;
