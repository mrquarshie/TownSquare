import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    university: '',
    phone: ''
  });
  const [universities, setUniversities] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    const res = await axios.get('/api/universities');
    setUniversities(res.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      alert('Registration failed: ' + error.response.data.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Join Marketplace</h2>
        
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>

        <select
          name="university"
          value={formData.university}
          onChange={handleChange}
          required
        >
          <option value="">Select University</option>
          {universities.map(uni => (
            <option key={uni} value={uni}>{uni}</option>
          ))}
        </select>

        <button type="submit">Register</button>
        
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;