import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/govt-theme.css';

const GovtLayout = ({ children }) => {
  return (
    <div className="govt-fade-in">
      <header className="govt-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="govt-title">VISHWAS</h1>
            <p className="govt-subtitle">Verification & Identity System with Holistic Automated Security</p>
          </div>
          <div>
            <Link to="/login" className="govt-button" style={{ marginLeft: '1rem' }}>Login</Link>
          </div>
        </div>
      </header>

      <nav className="govt-nav">
        <ul className="govt-nav-list">
          <li className="govt-nav-item"><Link to="/" className="govt-nav-link">Home</Link></li>
          <li className="govt-nav-item"><Link to="/about" className="govt-nav-link">About</Link></li>
          <li className="govt-nav-item"><Link to="/contact" className="govt-nav-link">Contact</Link></li>
        </ul>
      </nav>

      <div className="govt-container">
        {children}
      </div>

      <footer className="govt-footer">
        <div className="govt-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--white)', marginBottom: '1rem' }}>Important Links</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><Link to="/terms" className="govt-link">Terms of Service</Link></li>
                <li><Link to="/privacy" className="govt-link">Privacy Policy</Link></li>
                <li><Link to="/help" className="govt-link">Help & Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: 'var(--white)', marginBottom: '1rem' }}>Contact Us</h3>
              <p style={{ color: 'var(--white)', margin: 0 }}>
                Email: support@vishwas.gov.in<br />
                Phone: 1800-XXX-XXXX<br />
                (Mon-Fri, 9:00 AM - 6:00 PM)
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem', paddingTop: '1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--white)', margin: 0 }}>
              © 2026 VISHWAS - Government of India. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GovtLayout;