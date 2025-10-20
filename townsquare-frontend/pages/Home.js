import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
    fetchUniversities();
  }, []);

  const fetchItems = async (search = '', university = '') => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (university) params.university = university;
      
      const res = await axios.get('/api/items', { params });
      setItems(res.data.items || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const res = await axios.get('/api/universities');
      setUniversities(res.data || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(searchTerm, selectedUniversity);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to TownSquare</h1>
        <p>Buy and sell items within Ghanaian universities</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
          >
            <option value="">All Universities</option>
            {universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          
          <button type="submit">Search</button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <div className="items-grid">
          {items.length === 0 ? (
            <div className="no-items">No items found</div>
          ) : (
            items.map(item => (
              <div key={item._id} className="item-card">
                <Link to={`/item/${item._id}`}>
                  {item.images && item.images.length > 0 && (
                    <img 
                      src={`/uploads/${item.images[0]}`} 
                      alt={item.title}
                    />
                  )}
                  <div className="item-info">
                    <h3>{item.title}</h3>
                    <p className="price">GHS {item.price}</p>
                    <p className="university">{item.university}</p>
                    <p className="condition">{item.condition}</p>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;