const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // changed from `name`
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["manager", "developer"],
    default: "developer",
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
