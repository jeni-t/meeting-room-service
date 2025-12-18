import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  title: String,
  organizerEmail: String,
  startTime: Date,
  endTime: Date,
  status: { type: String, default: "confirmed" }, // confirmed / cancelled
});

export default mongoose.model("Booking", bookingSchema);
