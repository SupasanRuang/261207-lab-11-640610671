import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../backendLibs/dbLib";
import { v4 as uuidv4 } from "uuid";
import { checkToken } from "../../../../backendLibs/checkToken";

export default function roomIdMessageRoute(req, res) {
  if (req.method === "GET") {
    //check token
    const user = checkToken(req);
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });
    }
    //get roomId from url
    const roomId = req.query.roomId;

    const rooms = readChatRoomsDB();
    const roomIdx = rooms.findIndex((x) => x.roomId === roomId);
    //check if roomId exist
    if (roomIdx === -1) {
      return res.status(404).json({ ok: false, message: "Invalid room id" });
    } else {
      const listMessages = rooms[roomIdx].messages;
      return res.json({ ok: true, messages: listMessages });
    }
    //find room and return
    //...
  } else if (req.method === "POST") {
    //check token
    const user = checkToken(req);
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });
    }
    //get roomId from url
    const roomId = req.query.roomId;
    const rooms = readChatRoomsDB();
    const roomIdx = rooms.findIndex((x) => x.roomId === roomId);
    //check if roomId exist
    if (roomIdx === -1) {
      return res.status(404).json({ ok: false, message: "Invalid room id" });
    } else {
      const listMessages = rooms[roomIdx].messages;

      //validate body
      if (typeof req.body.text !== "string" || req.body.text.length === 0)
        return res
          .status(400)
          .json({ ok: false, message: "Invalid text input" });

      //create message
      const text = req.body.text;
      const newId = uuidv4();
      const newMessage = {
        messageId: newId,
        text: text,
        username: user.username,
      };
      listMessages.push(newMessage);
      rooms[roomIdx].messages = listMessages;

      writeChatRoomsDB(rooms);
      return res.json({ ok: true, messages: newMessage });
    }
  }
}
