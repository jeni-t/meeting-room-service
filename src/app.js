import express from "express";
import roomRoutes from "./routes/roomRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.type || "ServerError",
    message: err.message,
  });
});

mongoose
  .connect("mongodb://127.0.0.1:27017/meeting_service")
  .then(() => console.log("DB connected"))
  .catch(console.error);

app.listen(5000, () => console.log("Server running on 5000"));
