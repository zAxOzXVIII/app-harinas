const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    rol: {
      type: String,
      enum: ["gerente", "supervisor", "operador"],
      required: true,
      default: "operador",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
