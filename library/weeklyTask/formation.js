const { sortArr } = require("../../utils/serverFunctions");
const { playerStore } = require("../../source/playerStore.js");
const { Player, Club, Mass } = require("../../models/handler");
const { massList, roleList } = require("../../source/constants");

module.exports = async ({ all }) => {
  for (const mass of massList) {
    // get next match
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    let clubsData;
    if (all) {
      clubsData = await Club(mass).find();
    } else {
      clubsData = await Club(mass).find({ manager: null });
    }

    if (!clubsData) throw "Club not found";

    for (const {
      ref,
      tactics: { squad, formation },
    } of clubsData) {
      const playerData = await Player(mass).find({ ref: { $in: squad } });

      const division = [
        ...massData.divisions.divisionOne.map((x) => ({ division: "divisionOne", club: x })),
        ...massData.divisions.divisionTwo.map((x) => ({ division: "divisionTwo", club: x })),
        ...massData.divisions.divisionFour.map((x) => ({ division: "divisionFour", club: x })),
        ...massData.divisions.divisionThree.map((x) => ({ division: "divisionThree", club: x })),
      ].find((x) => x.club === ref).division;

      const competition = sortArr(
        [
          massData[division]?.calendar
            .filter((x) => x.home === ref || x.away === ref)
            ?.map(({ _doc }) => ({ ..._doc, competition: "division" })),
          massData.league.calendar
            .filter((x) => x.home === ref || x.away === ref)
            ?.map(({ _doc }) => ({ ..._doc, competition: "league" })),
          massData.cup.calendar.filter((x) => x.home === ref || x.away === ref)?.map(({ _doc }) => ({ ..._doc, competition: "cup" })),
        ],
        "date"
      ).find((x) => x.hg === null && x.hg === null)?.competition;

      if (!competition) return; //terminate task,, as season is over

      const fullPlayersList = squad
        .map((player) => playerData.find(({ ref }) => ref === player))
        .map(({ ref, energy, session, injury: { daysLeftToRecovery }, competition: c }) => ({
          ref,
          energy,
          session,
          injured: daysLeftToRecovery,
          roles: playerStore(ref).roles,
          rating: playerStore(ref).rating,
          suspended: c[competition].suspended,
        }))
        .filter(({ injured, energy, suspended }) => !injured && energy >= 20 && !suspended)
        .sort((x, y) => y.rating - x.rating);

      const newSquad = [
        ...roleList[formation].map((role) => {
          const index =
            fullPlayersList.findIndex((player) => player.roles.includes(role)) >= 0
              ? fullPlayersList.findIndex((player) => player.roles.includes(role))
              : fullPlayersList.length - 1;
          return fullPlayersList.splice(index, 1)[0];
        }),
      ].map((x) => x.ref);

      newSquad.push(...fullPlayersList.filter((x) => !newSquad.includes(x.ref)).map((x) => x.ref));

      await Club(mass).updateOne({ ref }, { $set: { "tactics.squad": newSquad } });
    }
  }
};
