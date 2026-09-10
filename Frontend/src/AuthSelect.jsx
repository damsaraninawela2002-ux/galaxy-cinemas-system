import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSelect = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '24px',
        padding: '50px 40px',
        maxWidth: '850px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        textAlign: 'center',
        border: '1px solid #334155'
      }}>
        {/* Header Section */}
        <p style={{ 
          color: '#e11d48', 
          fontSize: '13px', 
          letterSpacing: '3px', 
          textTransform: 'uppercase', 
          fontWeight: 'bold', 
          marginBottom: '8px' 
        }}>
          Galaxy Cinemas
        </p>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>
          Welcome to Galaxy Cinemas
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '40px' }}>
          Please select how you would like to continue.
        </p>

        {/* Selection Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '25px'
        }}>
          {/* Customer Card */}
          <div 
            onClick={() => navigate('/login')}
            style={{
              background: '#0f172a',
              border: '2px solid #334155',
              borderRadius: '16px',
              padding: '35px 25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#e11d48';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '65px',
              height: '65px',
              borderRadius: '50%',
              background: 'rgba(225, 29, 72, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px'
            }}>
              🍿
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Customer Portal
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Browse latest movies, select showtimes, and book your tickets.
            </p>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => navigate('/admin/login')}
            style={{
              background: '#0f172a',
              border: '2px solid #334155',
              borderRadius: '16px',
              padding: '35px 25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#38bdf8';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: '65px',
              height: '65px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px'
            }}>
              🛡️
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Admin Console
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              Manage movies, show schedules, seat layouts, and view reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelect;