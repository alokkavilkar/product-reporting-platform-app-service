import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router';
import './App.css'
import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductList from './components/ProductList';
import InspectProduct from './components/InspectProduct';
import FaultList from './components/FaultList';
import FaultReportPage from './components/FaultReportPage';
import Reports from './components/Reports';
import ProductUploader from './components/Products';
import ProtectedRoute from './components/ProtectedRoute';

function InspectProductWrapper() {
  const { productId } = useParams();
  return <InspectProduct productId={productId} />;
}

function App() {
  return (
    <Router>
      <div className="main-content">
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            <Route path="/inspect/:productId" element={
              <ProtectedRoute>
                <InspectProductWrapper />
              </ProtectedRoute>
            } />
            <Route path="/faults" element={
              <ProtectedRoute>
                <FaultList />
              </ProtectedRoute>
            } />
            <Route path="/report-fault/:productId" element={
              <ProtectedRoute>
                <FaultReportPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/upload-products" element={
              <ProtectedRoute>
                <ProductUploader />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
