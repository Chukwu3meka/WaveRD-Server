const matchTask = async () => {
  const day = new Date().getDay(),
    matchDate = new Date().toDateString(),
    matchType = day === 1 ? "division" : day === 6 ? "league" : day === 3 ? "cup" : null;

  switch (matchType) {
    case "cup":
      await require("./cup")({ matchType, matchDate });
      break;
    case "league":
      await require("./league")({ matchType, matchDate });
      break;
    case "division":
      await require("./division")({ matchType, matchDate });
      break;
    default:
      break;
  }

  console.log("*********************** _ TASK HAS COMPLETED _ *********************");
};

matchTask();
