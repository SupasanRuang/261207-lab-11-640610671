import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  if (req.method === "DELETE") {
    //get ids from url
    const roomId = req.query.roomId;
    const messageId = req.query.messageId;

    //check token
    const user = checkToken(req);
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Yon don't permission to access this api",
      });
    }

    const rooms = readChatRoomsDB();

    //check if roomId exist
    const roomIdx = rooms.findIndex((x) => x.roomId === roomId);
    if (roomIdx === -1) {
      return res.status(404).json({ ok: false, message: "Invalid room id" });
    }
    //check if messageId exist
    else {
      const listMessages = rooms[roomIdx].messages;
      const messageIdx = listMessages.findIndex(
        (x) => x.messageId === messageId
      );
      //console.log("M", roomIdx);
      if (messageIdx === -1) {
        return res
          .status(404)
          .json({ ok: false, message: "Invalid message id" });
      }
      //check if token owner is admin, they can delete any message
      else if (user.isAdmin) {
        listMessages.splice(messageIdx, 1);
        rooms[roomIdx].messages = listMessages;
        writeChatRoomsDB(rooms);
        return res.json({ ok: true });
      }
      //or if token owner is normal user, they can only delete their own message!
      else if (user.username === listMessages[messageIdx].username) {
        listMessages.splice(messageIdx, 1);
        rooms[roomIdx].messages = listMessages;
        writeChatRoomsDB(rooms);
        return res.json({ ok: true });
      } else {
        return res.status(403).json({
          ok: false,
          message: "You do not have permission to access this data",
        });
      }
    }
  }
}
