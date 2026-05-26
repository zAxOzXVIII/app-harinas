const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const User = require("../src/models/User");
  const email = "admin@nativa.com";
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      email,
      nombre: "Admin Test",
      password: await bcrypt.hash("admin123", 10),
      rol: "gerente",
    });
  }
});
