const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URI = mongod.getUri();
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test_jwt_secret_nativa_app_harinas_2026";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.CORS_ORIGINS = "http://localhost:8082";
};
