const { massList } = require("../../source/constants");
const { Player, Mass, Club } = require("../../models/handler");
const { sortArr, acceptOffer } = require("../../utils/serverFunctions");

module.exports = async () => {
  for (const mass of massList) {
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";
    const unmanagedClubs = await Club(mass).find({ manager: null });
    const unmanagedClubsRef = unmanagedClubs.map((x) => x.ref);
    //get premium offers after 1 day
    const unmanagedClubsOffers = massData.offer.filter(
      (x) => unmanagedClubsRef.includes(x.to) && Math.round((new Date() - new Date(x.date)) / (1000 * 60 * 60 * 24) - 1) >= 0
    );

    // create object of array for each player
    const playerOffers = {};
    // create array of offer each premium player has received
    for (const offer of unmanagedClubsOffers) {
      if (playerOffers[offer.player]) {
        playerOffers[offer.player].push(offer);
      } else {
        playerOffers[offer.player] = [offer];
      }
    }

    // accept highest bidder with earlier date
    for (const offers of Object.values(playerOffers)) {
      const bidOffers = sortArr(offers, "offers");
      const { date, from, to, fee, player } = bidOffers[0];

      await acceptOffer({
        date,
        from,
        to,
        mass,
        fee,
        player,
        ackMsg: `@(club,${from},title) has completed the signing of @(player,${player},name) on a bidding war started on ${new Date(
          date
        ).toDateString()}, for a fee rumored to be in the range of $${fee}m. Details of bid: ${bidOffers
          .map((x) => `@(club,${x.from},title)[$${x.fee}, ${new Date(x.date).toDateString()}]`)
          .join(", ")}.`,
        Player,
        Mass,
        Club,
      });
    }
  }
};
