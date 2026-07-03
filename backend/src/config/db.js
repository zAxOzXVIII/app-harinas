const mongoose = require("mongoose");
const env = require("./env");

const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    retryReads: true,
  });
  console.log("MongoDB conectado correctamente");
};

module.exports = { connectDb };
