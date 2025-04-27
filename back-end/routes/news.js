const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock news data
const mockNews = [
  {
    id: 1,
    category: 'political',
    title: 'Major Political Reform Announced',
    content: 'Lorem ipsum...',
    summary: 'Brief overview of reform...',
    image: 'political-news.jpg'
  },
  {
    id: 2,
    category: 'sports',
    title: 'Local Team Wins Championship',
    content: 'Lorem ipsum...',
    summary: 'Victory celebration...',
    image: 'sports-news.jpg'
  },
  // Add more mock news...
];

router.get('/:category', async (req, res) => {
  const { category } = req.params;
  const news = mockNews.filter(item => item.category === category);
  res.json(news);
});

module.exports = router; 