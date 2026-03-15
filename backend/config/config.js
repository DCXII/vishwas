
module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vishwas',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
};
