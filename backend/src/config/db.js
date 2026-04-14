const mongoose = require("mongoose");
const env = require("./env");

const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB conectado correctamente");
};

module.exports = { connectDb };
