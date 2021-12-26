const managers = [];

// Join manager to chat
exports.userJoin = (chatId, club, handle, soccermass) => {
  const manager = { chatId, club, handle, soccermass };
  const newUser = managers.find((x) => x.handle === handle && x.club === club && x.soccermass === soccermass) ? false : true;
  newUser && managers.push(manager);
};

// Get current manager
exports.getCurrentUser = (chatId) => {
  return managers.find((manager) => manager.chatId === chatId);
};

// User leaves chat
exports.userLeave = (chatId) => {
  const index = managers.findIndex((manager) => manager.chatId === chatId);
  if (index !== -1) {
    return managers.splice(index, 1)[0];
  }
};

// Get room managers
exports.getRoomUsers = () => managers.length;

exports.formatMessage = (handle, club, text) => {
  const date = new Date();
  return {
    handle,
    club,
    text,
    time: `${date.getUTCHours()}:${date.getUTCMinutes()}`,
  };
};
