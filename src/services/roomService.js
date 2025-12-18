import Room from "../models/Room.js";

export async function createRoom(data) {
  const exists = await Room.findOne({ name: data.name.toLowerCase() });
  if (exists) throw { status: 400, message: "Room name already exists" };

  const room = await Room.create({
    name: data.name.toLowerCase(),
    capacity: data.capacity,
    floor: data.floor,
    amenities: data.amenities,
  });

  return room;
}

export async function listRooms(filters) {
  const query = {};

  if (filters.minCapacity)
    query.capacity = { $gte: Number(filters.minCapacity) };

  if (filters.amenity)
    query.amenities = { $in: [filters.amenity] };

  return await Room.find(query);
}
