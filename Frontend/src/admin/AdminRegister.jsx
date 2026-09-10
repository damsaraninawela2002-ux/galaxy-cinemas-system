import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Auth.css';

export default function AdminRegister() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', adminKey: '' },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
      adminKey: Yup.string().required('Admin Security Key is required')
    }),
    onSubmit: async (values) => {
      try {
        await axios.post('http://localhost:5000/api/admin/auth/register', values);
        toast.success("Admin registered successfully!");
        navigate('/admin/login');
      } catch (err) {
        toast.error(err.response?.data?.message || "Registration failed!");
      }
    }
  });

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderColor: '#f59e0b' }}>
        <h2 className="auth-title">Admin Registration</h2>
        <p className="auth-subtitle">Authorized personnel registration portal</p>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input type="text" name="username" placeholder="Username" {...formik.getFieldProps('username')} />
          </div>
          {formik.touched.username && formik.errors.username && <div className="error-text">{formik.errors.username}</div>}

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

          <div className="input-group" style={{ borderColor: '#f59e0b' }}>
            <span className="input-icon">🔑</span>
            <input type="password" name="adminKey" placeholder="Admin Security Key (e.g. 2002)" {...formik.getFieldProps('adminKey')} />
          </div>
          {formik.touched.adminKey && formik.errors.adminKey && <div className="error-text">{formik.errors.adminKey}</div>}

          <button type="submit" className="auth-button" style={{ backgroundColor: '#f59e0b' }}>Register Admin</button>
        </form>

        <p className="auth-footer">
          Already an Admin? <Link to="/admin/login" style={{ color: '#f59e0b' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}