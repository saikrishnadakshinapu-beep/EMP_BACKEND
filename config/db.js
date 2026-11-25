const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://saikrishnadakshinapu:uG4CCgqyGFfIzPUc@krishnatravels.wemhndx.mongodb.net/employeeDB?retryWrites=true&w=majority';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

module.exports = connectDB;
