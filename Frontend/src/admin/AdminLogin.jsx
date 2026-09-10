import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import '../Auth.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required')
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post('http://localhost:5000/api/admin/auth/login', values);
        login(res.data.admin, res.data.token);
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
        toast.success("Admin login successful!");
        navigate('/admin');
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid Admin credentials");
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderColor: '#f59e0b' }}>
        <h2 className="auth-title">Admin Console</h2>
        <p className="auth-subtitle">Sign in to manage Galaxy Cinemas</p>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="input-group">
            <span className="input-icon">✉</span>
            <input type="email" name="email" placeholder="Admin Email" {...formik.getFieldProps('email')} />
          </div>
          {formik.touched.email && formik.errors.email && <div className="error-text">{formik.errors.email}</div>}

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input type="password" name="password" placeholder="Password" {...formik.getFieldProps('password')} />
          </div>
          {formik.touched.password && formik.errors.password && <div className="error-text">{formik.errors.password}</div>}

          <button type="submit" className="auth-button" style={{ backgroundColor: '#f59e0b' }}>Sign In to Console</button>
        </form>

        <p className="auth-footer">
          Need new admin access? <Link to="/admin/register" style={{ color: '#f59e0b' }}>Register Admin</Link>
        </p>
      </div>
    </div>
  );
}