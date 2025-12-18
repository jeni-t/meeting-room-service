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

export const utilization = async (req, res, next) => {
  try {
    const data = await roomUtilization(req.query.from, req.query.to);
    res.json(data);
  } catch (e) { next(e); }
};
