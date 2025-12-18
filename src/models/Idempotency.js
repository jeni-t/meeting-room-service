import mongoose from "mongoose";

const idempotencySchema = new mongoose.Schema({
  key: String,
  organizerEmail: String,
  bookingId: String,
});

export default mongoose.model("Idempotency", idempotencySchema);
