const { Player, Mass, Club } = require("../../models/handler");
const { massList } = require("../../source/constants");
const { sortArr, acceptOffer } = require("../../utils/serverFunctions");

module.exports = async () => {
  for (const mass of massList) {
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";

    //get premium offers after 3 days
    const premiumOffers = massData.offer.filter(
      (x) => x.to === "club000000" && Math.round((new Date() - new Date(x.date)) / (1000 * 60 * 60 * 24) - 1) >= 2
    );

    // create object of array for each player
    const playerOffers = {};

    // create array of offer each premium player has received
    for (const offer of premiumOffers) {
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
        ackMsg: `@(club,${from},title) has completed the signing of Free Agent: @(player,${player},name) on a bidding war started on ${new Date(
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
