import { createRoom, listRooms } from "../services/roomService.js";

export const create = async (req, res, next) => {
  try {
    const room = await createRoom(req.body);
    res.status(201).json(room);
  } catch (e) { next(e); }
};

export const list = async (req, res, next) => {
  try {
    const rooms = await listRooms(req.query);
    res.json(rooms);
  } catch (e) { next(e); }
};
