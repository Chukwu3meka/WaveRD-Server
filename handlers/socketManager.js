const io = require("../server").io;
const { formatMessage, userJoin, getCurrentUser, userLeave, getRoomUsers } = require("../source/library/chatSocket");

module.exports = (socket) => {
  socket.on("joinRoom", (newUser) => {
    const { chatId, club, handle, soccermass } = newUser;
    userJoin(chatId, club, handle, soccermass);
    socket.join("SoccerMASS");
    // Welcome current manager
    socket.emit("message", formatMessage("SoccerMASS", "SoccerMASS", "Welcome to SoccerMASS Chat room!"));
    // Broadcast when a manager connects
    socket.broadcast.to("SoccerMASS").emit("message", formatMessage("SoccerMASS", "SoccerMASS", `${handle} has joined the room`));
    // Send users and room info
    io.to("SoccerMASS").emit("roomUsers", { managers: getRoomUsers() });
  });

  // Listen for chatMessage
  socket.on("chatMessage", ({ chatId, newMessage }) => {
    const { handle, club } = getCurrentUser(chatId);
    io.to("SoccerMASS").emit("message", formatMessage(handle, club, newMessage));
  });

  // Runs when client disconnects
  socket.once("disconnect", ({ chatId }) => {
    console.log("sdsd", chatId, socket.id);
    // const manager = userLeave(chatId);

    // if (manager) {
    //   io.to("SoccerMASS").emit("message", formatMessage("SoccerMASS", `${manager.handle} has left the chat`));

    //   // Send users and room info
    //   io.to("SoccerMASS").emit("roomUsers", {
    //     users: getRoomUsers("SoccerMASS"),
    //   });
    // }
  });
};
