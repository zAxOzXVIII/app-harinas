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
    expoPushToken: {
      type: String,
      default: null,
      trim: true,
    },
    securityQuestions: {
      type: [
        {
          _id: false,
          questionId: { type: String, required: true, trim: true },
          answerHash: { type: String, required: true },
        },
      ],
      default: [],
      select: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
