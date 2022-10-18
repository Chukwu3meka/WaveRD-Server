const { Mass, Club, Profile } = require("../../models/handler");

module.exports = async () => {
  const unverifiedProfiles = await Profile.find({ "stat.verified": { $ne: "verified" } });
  // update later to one day
  const unverifiedProfilesOver24hrs = unverifiedProfiles.filter(
    (x) => Math.round((new Date() - new Date(x.stat.registered)) / (1000 * 60 * 60 * 24) - 1) >= 30
  );

  for (const {
    club,
    mass,
    email,
    handle,
    division,
    stat: { registered },
  } of unverifiedProfilesOver24hrs) {
    await Club(mass).updateOne(
      { ref: club },
      {
        $set: {
          manager: null,
          email: null,
          $push: {
            "history.events": {
              $each: [
                `OFFICIAL: ${handle} sacked as @(club,${club},title) manager. He has been relieved of his duties as first team coach - @(club,${club},nickname) president`,
              ],
              $slice: 20,
              $position: 0,
            },
            report: {
              $each: [
                {
                  title: `Breaking: @(club,${club},title) sack coach ${handle}`,
                  content: `OFFICIAL: ${handle} sacked as @(club,${club},title) manager. He has been relieved of his duties as first team coach - @(club,${club},nickname) president`,
                  image: `/club/${club}.webp`,
                },
              ],
              $position: 0,
            },
          },
        },
      }
    );

    await Club(mass).updateOne(
      { ref: club, "history.managers": { $elemMatch: { manager: handle, arrival: registered } } },
      { $set: { "history.$.managers": new Date() } }
    );

    const massData = await Mass.findOne({ ref: mass });
    if (!massData) throw "invalid mass";

    await Mass.updateOne(
      { ref: mass },
      {
        $set: { [`unmanaged.${division}`]: massData.unmanaged[division] + 1, "unmanaged.total": massData.unmanaged.total + 1 },
        $push: {
          news: {
            $each: [
              {
                title: `Breaking: @(club,${club},title) sack coach ${handle}`,
                content: `OFFICIAL: ${handle} sacked as @(club,${club},title) manager. He has been relieved of his duties as first team coach - @(club,${club},nickname) president`,
                image: `/club/${club}.webp`,
              },
            ],
            $slice: 15,
            $position: 0,
          },
        },
      }
    );

    await Profile.deleteOne({ club, mass, email, handle, division });
  }
};
