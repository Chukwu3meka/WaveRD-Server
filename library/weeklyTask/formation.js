const { clubList } = require("../../source/clubStore");
const { massList } = require("../../source/constants");
const { playerStore } = require("../../source/playerStore.js");
const { Player, Club, Mass } = require("../../models/handler");
const { scoreGenerator, range, sortArr } = require("../../utils/serverFunctions");

module.exports = async () => {
  for (const mass of massList) {
    // get next match
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Mass not found";

    const clubsData = await Club(mass).find({});
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

      const fullPlayerList = squad
        .map((player) => playerData.find(({ ref }) => ref === player))
        .map(({ ref, energy, session, injury: { daysLeftToRecovery }, competition: c }) => ({
          ref,
          energy,
          session,
          competition: c,
          injured: daysLeftToRecovery,
          roles: playerStore(ref).roles,
          rating: playerStore(ref).rating,
          suspended: c[competition].suspended,
        }))

        .filter(({ injured, energy, suspended }) => !injured && energy >= 20 && !suspended)
        .sort((x, y) => y.rating - x.rating);

      const newSquad = [
        ...roleList[formation].map((role) => {
          const index = fullPlayersList.findIndex((player) => player.roles.includes(role));

          if (index >= 0) {
            const data = index >= 0 ? fullPlayersList[index] : fullPlayersList[fullPlayersList.length - 1];

            fullPlayersList.splice(index, 1);

            return data;
          }
        }),
        ...fullPlayersList.slice(0, 7),
      ];

      // console.log(ref, squad);

      // const clubData = await Club(mass).findOne({});
      // if (!clubData) throw "Club not found";
      // console.log({ club });
      // await Player(mass).updateMany({ session: { $lte: -30 } }, { $set: { emotion: "Miserable" } });
      // // set injury type to null if days to recovery is 0
      // await Player(mass).updateMany(
      //   { emotion: "Miserable", "transfer.forcedListed": { $ne: true } },
      //   { $set: { "transfer.forcedListed": true } }
      // );
    }
  }
};
