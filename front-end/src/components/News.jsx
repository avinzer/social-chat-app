/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/_news.scss';

const NewsCategory = ({ category }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/news/${category}`);
        setNews(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news');
        setLoading(false);
      }
    };

    fetchNews();
  }, [category]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="news-list">
      {news.map((item) => (
        <div key={item.id} className="news-card">
          {item.image && (
            <div className="news-image">
              <img src={item.image} alt={item.title} />
            </div>
          )}
          <div className="news-content">
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <button 
              className="read-more"
              onClick={() => window.open(item.url, '_blank')}
            >
              Read More
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const News = () => {
  const navigate = useNavigate();

  return (
    <div className="news-container">
      <nav className="news-nav">
        <Link to="/news/political">Political</Link>
        <Link to="/news/sports">Sports</Link>
        <Link to="/news/gaming">Gaming</Link>
      </nav>

      <Routes>
        <Route path="/" element={<NewsCategory category="political" />} />
        <Route path="/political" element={<NewsCategory category="political" />} />
        <Route path="/sports" element={<NewsCategory category="sports" />} />
        <Route path="/gaming" element={<NewsCategory category="gaming" />} />
      </Routes>
    </div>
  );
};

export default News; 