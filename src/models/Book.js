const { Schema, model } = require("mongoose");

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Book", BookSchema);
