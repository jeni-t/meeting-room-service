import Booking from "../models/Booking.js";
import Idempotency from "../models/Idempotency.js";
import { isBusinessHours, durationOK } from "../utils/time.js";

export async function isOverlapping(roomId, start, end) {
  const overlapping = await Booking.findOne({
    roomId,
    status: "confirmed",
    $or: [
      { startTime: { $lt: end }, endTime: { $gt: start } }
    ]
  });

  return !!overlapping;
}

export async function createBooking(data, idempotencyKey) {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  if (start >= end) throw { status: 400, message: "startTime < endTime required" };
  if (!durationOK(start, end)) throw { status: 400, message: "Duration must be 15 min - 4 hours" };
  if (!isBusinessHours(start, end)) throw { status: 400, message: "Outside business hours" };

  // check idempotency
  let idRecord = await Idempotency.findOne({
    key: idempotencyKey,
    organizerEmail: data.organizerEmail
  });

  if (idRecord) {
    const existing = await Booking.findById(idRecord.bookingId);
    return existing;
  }

  // Check overlap
  const overlap = await isOverlapping(data.roomId, start, end);
  if (overlap) throw { status: 409, message: "Overlapping booking" };

  const booking = await Booking.create({
    ...data,
    startTime: start,
    endTime: end,
    status: "confirmed"
  });

  await Idempotency.create({
    key: idempotencyKey,
    organizerEmail: data.organizerEmail,
    bookingId: booking._id
  });

  return booking;
}

export async function cancelBooking(id) {
  const booking = await Booking.findById(id);
  if (!booking) throw { status: 404, message: "Booking not found" };

  const now = new Date();
  const diffHours = (booking.startTime - now) / (1000 * 60 * 60);

  if (diffHours < 1 && booking.status !== "cancelled")
    throw { status: 400, message: "Cannot cancel less than 1 hour before start" };

  booking.status = "cancelled";
  await booking.save();

  return booking;
}

export async function roomUtilization(from, to) {
  const bookings = await Booking.find({
    status: "confirmed",
    $or: [
      { startTime: { $lt: new Date(to) }, endTime: { $gt: new Date(from) } }
    ]
  }).populate("roomId");

  const totalBusinessHours = 12 * countWeekdays(from, to);

  const roomHours = {};

  bookings.forEach(b => {
    const room = b.roomId;
    const overlapStart = Math.max(new Date(b.startTime), new Date(from));
    const overlapEnd = Math.min(new Date(b.endTime), new Date(to));
    const hours = (overlapEnd - overlapStart) / (1000 * 60 * 60);

    if (!roomHours[room._id]) roomHours[room._id] = { room, hours: 0 };
    roomHours[room._id].hours += hours;
  });

  return Object.values(roomHours).map(r => ({
    roomId: r.room._id,
    roomName: r.room.name,
    totalBookingHours: r.hours,
    utilizationPercent: r.hours / totalBusinessHours
  }));
}

function countWeekdays(from, to) {
  let d = new Date(from);
  let count = 0;
  while (d <= new Date(to)) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}
