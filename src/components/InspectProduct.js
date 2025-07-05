import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import { useNavigate } from 'react-router';
import './InspectProduct.css';

function InspectProduct({ productId }) {
  const { getAccessTokenSilently } = useAuth0();
  const api = createApi({ getAccessTokenSilently });
  const [result, setResult] = useState('pass');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [productName, setProductName] = useState('');
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.fetchProducts()
      .then(res => {
        const found = res.data.find(p => p.id === parseInt(productId));
        if (found) setProductName(found.name);
      })
      .catch(() => setProductName(''));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        result,
        inspection_notes: notes,
        inspected_by: 1,
      };
      await api.inspectProduct(productId, payload);
      setSuccessMsg('Inspection submitted successfully!');
      setNotes('');
      setResult('pass');

      setTimeout(() => {
        navigate('/products'); // redirect after success
      }, 1500);
    } catch (err) {
      setError('Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inspect-form-container">
      <h2 className="form-title">Inspect Product</h2>
      {productName && <p className="product-label">Product: <strong>{productName}</strong></p>}

      <form onSubmit={handleSubmit} className="inspect-form">
        <label>
          Result:
          <select value={result} onChange={e => setResult(e.target.value)}>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        </label>

        <label>
          Notes:
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add inspection notes (optional)"
            rows={4}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Inspection'}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}
      {successMsg && <p className="success-msg">{successMsg}</p>}
    </div>
  );
}

export default InspectProduct;
