const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  time: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  note: { type: String },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
