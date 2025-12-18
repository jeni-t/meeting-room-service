import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  capacity: Number,
  floor: Number,
  amenities: [String],
});

export default mongoose.model("Room", roomSchema);
