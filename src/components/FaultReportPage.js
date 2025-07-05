import React from 'react';
import { useParams, useNavigate } from 'react-router';
import FaultReportForm from './FormReportForm';
import './FaultReportPage.css';

function FaultReportPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="report-page-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Faults
      </button>
      <FaultReportForm productId={productId} onSuccess={() => navigate(-1)} />
    </div>
  );
}

export default FaultReportPage;
