import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createApi } from '../api';
import './Reports.css';

// eslint-disable-next-line react-hooks/exhaustive-deps
function Reports() {
  const { getAccessTokenSilently } = useAuth0();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const api = createApi({ getAccessTokenSilently });

  const loadReports = () => {
    api.fetchFaultReports()
      .then(response => {
        setReports(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const openModal = (report) => {
    setSelectedReport(report);
    setRemarks('');
  };

  const closeModal = () => {
    setSelectedReport(null);
    setRemarks('');
  };

  const handleResolve = async () => {
    if (!remarks.trim()) {
      alert("Remarks are required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.resolveFault(selectedReport.id, {
        remarks,
        resolved_by: 'engineer'
      });
      closeModal();
      loadReports();
    } catch (err) {
      console.error("Error resolving fault:", err);
      alert("Failed to resolve fault.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader" aria-label="Loading Reports"></div>;

  return (
    <div className="reports-container">
      <h2 className="reports-title">Fault Reports</h2>
      {reports.length === 0 ? (
        <p className="no-reports">No reports found.</p>
      ) : (
        <div className="reports-grid">
          {reports.map(report => (
            <div
              key={report.id}
              className="report-card"
              onClick={() => openModal(report)}
            >
              <h3>{report.product}</h3>
              <p className={`status-text ${report.status}`}>{report.status}</p>
              <p>{report.description}</p>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedReport.product}</h3>
            <p><strong>Status:</strong> {selectedReport.status}</p>
            <p><strong>Description:</strong> {selectedReport.description}</p>
            <img src={selectedReport.image_url} alt="Fault" className="modal-image" />

            <textarea
              placeholder="Enter remarks for resolution"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="remarks-input"
              disabled={submitting}
            />

            <div className="modal-actions">
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
              <button onClick={handleResolve} className="resolve-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
