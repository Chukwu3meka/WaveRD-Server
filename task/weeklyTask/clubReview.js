const { Club } = require("../../models/handler");
const { massList } = require("../../source/constants");

module.exports = async () => {
  for (const mass of massList) {
    const clubsData = await Club(mass).find();
    if (!clubsData) throw "Club not found";

    for (const {
      ref,
      history: { lastFiveMatches },
    } of clubsData) {
      const clubReview = lastFiveMatches.reduce((total, match) => {
        const matchPoint = match === "win" ? 20 : match === "tie" ? 10 : 5;
        return total + matchPoint;
      }, 0);

      await Club(mass).updateOne(
        { ref },
        {
          $set: {
            review: {
              mediaCoverage: Math.ceil(clubReview / 20),
              boardConfidence:
                Math.ceil(clubReview / 20) === 5
                  ? "A"
                  : Math.ceil(clubReview / 20) >= 4
                  ? "B"
                  : Math.ceil(clubReview / 20) >= 4
                  ? "C"
                  : Math.ceil(clubReview / 20) >= 4
                  ? "D"
                  : "E",
              fansSatisfaction: clubReview,
              presidentsMessage:
                clubReview >= 95
                  ? "The expectaion of the board is quit high, you have given your best to team. There is a lot of optimism about where our current form can lead us to"
                  : clubReview >= 85
                  ? "A lot of clubs out there, will have a difficult time sleeping considering the form our players are in. There's a lot of praise from the fans too. They're every where with your name"
                  : clubReview >= 75
                  ? "We've been consistent in some matches, but we belive you can give more. You've shown you're capable of the Job, in some matches already"
                  : clubReview >= 65
                  ? "We demand a bit more from you, if we're to get any silverware. It seems our current tactics is not working, try improving it and don't be afraid to make tactical changes, to avoid a change in your role from the board"
                  : clubReview >= 55
                  ? "You can do better than this, this is not the result the fans and the board expect from you. We strongly demand improvement sooner. Some members of the board are questioning your capability"
                  : clubReview >= 45
                  ? "It's time to take advantage of the Transfer Market or look into your subs. This team can't compete for any thing worthy"
                  : clubReview >= 35
                  ? "Talks about replacement keeps coming up. We've become the talk of the town as a result of the negative result"
                  : clubReview >= 25
                  ? "We are currently in transition"
                  : "A vote of No-Trust was raised, in the last managerial meeting, but i still belive there's room for improvment. You have this season to prove them wrong",
            },
          },
        }
      );
    }
  }
};
