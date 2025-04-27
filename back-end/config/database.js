const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/postApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const db = {
  find: async (collection, query = {}) => {
    const model = mongoose.model(collection.charAt(0).toUpperCase() + collection.slice(1, -1));
    return model.find(query).populate('author', 'username');
  },
  findOne: async (collection, query = {}) => {
    const model = mongoose.model(collection.charAt(0).toUpperCase() + collection.slice(1, -1));
    return model.findOne(query).populate('author', 'username');
  },
  insertOne: async (collection, document) => {
    const model = mongoose.model(collection.charAt(0).toUpperCase() + collection.slice(1, -1));
    const newDoc = new model(document);
    return newDoc.save();
  },
  updateOne: async (collection, query, update) => {
    const model = mongoose.model(collection.charAt(0).toUpperCase() + collection.slice(1, -1));
    return model.updateOne(query, update);
  }
};

module.exports = db; 