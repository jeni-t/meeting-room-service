import { createBooking, cancelBooking, roomUtilization } from "../services/bookingService.js";
import Booking from "../models/Booking.js";

export const create = async (req, res, next) => {
  try {
    const key = req.headers["idempotency-key"] || "";
    const booking = await createBooking(req.body, key);
    res.status(201).json(booking);
  } catch (e) { next(e); }
};

export const list = async (req, res, next) => {
  try {
    const { roomId, from, to, limit = 10, offset = 0 } = req.query;

    const query = {};
    if (roomId) query.roomId = roomId;
    if (from && to)
      query.$or = [{ startTime: { $lt: to }, endTime: { $gt: from } }];

    const items = await Booking.find(query)
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ items, total, limit: Number(limit), offset: Number(offset) });
  } catch (e) { next(e); }
};

export const cancel = async (req, res, next) => {
  try {
    const data = await cancelBooking(req.params.id);
    res.json(data);
  } catch (e) { next(e); }
};

export const utilization = async (req, res) => {
  try {
    const bookings = await Booking.find();
    const rooms = await Room.find();

    const report = rooms.map(room => {
      const roomBookings = bookings.filter(
        b =>
          b.roomId.toString() === room._id.toString() &&
          b.status !== "cancelled"
      );

      const totalSlots = room.totalSlots || 10;
      const bookedSlots = roomBookings.length;

      const utilization =
        ((bookedSlots / totalSlots) * 100).toFixed(0) + "%";

      return {
        roomId: room.name,
        totalSlots,
        bookedSlots,
        utilization
      };
    });

    res.status(200).json({
      totalRooms: rooms.length,
      report
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
