const { Player, Mass, Club } = require("../../models/handler");
const { massList } = require("../../source/constants");
const { sortArr } = require("../../utils/serverFunctions");

module.exports = async () => {
  for (const mass of massList) {
    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "Club not found";

    //get premium offers
    const premiumOffers = massData.offer.filter(
      (x) => x.to === "club000000" && Math.round((new Date() - new Date(x.date)) / (1000 * 60 * 60 * 24) - 1) >= 3
    );

    // create object of array for each player
    const playerOffers = {};

    // create array of offer each premium player has received
    for (const offer of premiumOffers) {
      console.log(offer.player);
      if (playerOffers[offer.player]) {
        playerOffers[offer.player].push(offer);
      } else {
        playerOffers[offer.player] = [offer];
      }
    }

    // accept highest bidder with earlier date
    for (const player of Object.values(playerOffers)) {
      const offers = sortArr(player, "offers");
      const { date, from: club, fee, player: ref } = offers[0];

      await acceptOffer({
        date,
        club,
        fee,
        mass,
        player: ref,
        offers: offers.map((x) => `@(club,${x.from},title)[$${x.fee}, ${new Date(x.date).toDateString()}]`).join(", "),
      });
    }
  }
};

const acceptOffer = async ({ date, mass, club, fee, player, offers }) => {
  try {
    const clubData = await Club(mass).findOne({ ref: club });

    if (fee > clubData.budget) throw "Insufficient Funds";

    if (clubData.tactics.squad.length >= process.env.MAX_SQUAD || clubData.tactics.squad.length <= process.env.MIN_SQUAD)
      throw "Squad limit prevents registeration";

    // ______________________________________ update mass data
    await Mass.updateOne(
      { ref: mass },
      {
        $push: {
          news: {
            $each: [
              {
                title: `OFFICIAL: @(club,${club},title) Transfer NEWS`,
                content: `@(club,${club},title) has completed the signing of @(player,${player},name) on a bidding war started on ${new Date(
                  date
                ).toDateString()}, for a fee rumored to be in the range of $${fee}m. Details of bid: ${offers}.`,
                image: `/player/${player}.webp`,
              },
            ],
            $slice: 15,
            $position: 0,
          },
          transfer: {
            $each: [
              {
                to: club,
                fee: fee,
                from: "club000000",
                player,
              },
            ],
            $slice: 50,
            $position: 0,
          },
        },
        $pull: { offer: { player } },
      }
    );

    // _______________________________________ update club data
    const {
      history: {
        transfer: { priciestArrival, cheapestArrival },
      },
    } = clubData;

    await Club(mass).updateOne(
      { ref: club },
      {
        $pull: {
          transferTarget: player,
        },
        $addToSet: {
          "tactics.squad": player,
        },
        $inc: { "nominalAccount.arrival": fee, budget: -fee },
        $set: {
          "history.transfer.priciestArrival": {
            club: fee > Number(priciestArrival.fee) ? club : priciestArrival.club,
            fee: fee > Number(priciestArrival.fee) ? fee : priciestArrival.fee,
            player: fee > Number(priciestArrival.fee) ? player : priciestArrival.player,
            date: fee > Number(priciestArrival.fee) ? new Date() : priciestArrival.date,
          },
          "history.transfer.cheapestArrival": {
            club: cheapestArrival.fee === null || fee < cheapestArrival.fee ? club : cheapestArrival.club,
            fee: cheapestArrival.fee === null || fee < cheapestArrival.fee ? fee : cheapestArrival.fee,
            player: cheapestArrival.fee === null || fee < cheapestArrival.fee ? player : cheapestArrival.player,
            date: cheapestArrival.fee === null || fee < cheapestArrival.fee ? new Date() : cheapestArrival.date,
          },
        },
      }
    );

    // _______________________________________ update player data
    await Player(mass).updateOne(
      { ref: player },
      {
        $set: {
          club,
          "transfer.offers": [],
          "transfer.locked": true,
          "transfer.listed": false,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
};
