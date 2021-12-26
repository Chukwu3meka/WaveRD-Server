const { playLeagueMatch } = require("../playMatch/league");

module.exports = async () => {
  const day = new Date().getDay(),
    matchType =
      day === 0 || day === 6
        ? "League"
        : day === 1
        ? "LeagueSuperCup"
        : day === 2
        ? "EuropaLeague"
        : day === 3
        ? "ChampionsLeague"
        : day === 4
        ? "UEFASuperCup"
        : day === 5
        ? "LeagueCup"
        : null,
    matchDate = new Date().toDateString();

  switch (matchType) {
    case "League": {
      await playLeagueMatch({ matchType, matchDate });
      break;
    }
    case "LeagueCup": {
      console.log(matchType, matchDate);
      break;
    }
    case "LeagueSuperCup": {
      console.log(matchType, matchDate);
      break;
    }
    case "ChampionsLeague": {
      console.log(matchType, matchDate);
      break;
    }
    case "EuropaLeague": {
      console.log(matchType, matchDate);
      break;
    }
    case "UEFASuperCup": {
      console.log(matchType, matchDate);
      break;
    }
    default:
      break;
  }
};
