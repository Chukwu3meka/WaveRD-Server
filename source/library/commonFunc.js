//to shuffle array
module.exports.shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 3));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// check if club is in fixture
module.exports.clubInFixture = (matchDay, club) => {
  if (matchDay.length === 0) return false;
  let status = false;
  matchDay.some((fixture) => {
    const fixtureArray = fixture.split("@@@");
    if (fixtureArray.includes(club)) {
      status = true;
      return true;
    }
  });
  return status;
};

// set player rating
module.exports.setValue = (rating) => {
  if (rating >= 98 && rating < 100) {
    return 200;
  } else if (rating >= 96 && rating < 98) {
    return 190;
  } else if (rating >= 94 && rating < 96) {
    return 180;
  } else if (rating >= 92 && rating < 94) {
    return 170;
  } else if (rating >= 90 && rating < 92) {
    return 160;
  } else if (rating >= 88 && rating < 90) {
    return 150;
  } else if (rating >= 86 && rating < 88) {
    return 140;
  } else if (rating >= 84 && rating < 86) {
    return 130;
  } else if (rating >= 82 && rating < 84) {
    return 120;
  } else if (rating >= 80 && rating < 82) {
    return 110;
  } else if (rating >= 78 && rating < 80) {
    return 100;
  } else if (rating >= 76 && rating < 78) {
    return 90;
  } else if (rating >= 74 && rating < 76) {
    return 80;
  } else if (rating >= 72 && rating < 74) {
    return 70;
  } else if (rating >= 70 && rating < 72) {
    return 60;
  } else if (rating >= 66 && rating < 70) {
    return 50;
  } else if (rating >= 62 && rating < 66) {
    return 40;
  } else if (rating >= 58 && rating < 62) {
    return 35;
  } else if (rating >= 54 && rating < 58) {
    return 30;
  } else if (rating >= 50 && rating < 54) {
    return 25;
  } else if (rating >= 45 && rating < 50) {
    return 20;
  } else {
    return 10;
  }
};
// sort players in goal,assist and mp order
module.exports.sortArray = (item, port = "goal", len = 6) => {
  item = item.filter((x) => x !== null);
  item.sort((x, y) => {
    if (port === "goal") {
      if (x.goal > y.goal) return -1;
      if (x.goal < y.goal) return 1;
      if (x.mp < y.mp) return -1;
      if (x.mp > y.mp) return 1;
      if (x.assist > y.assist) return -1;
      if (x.assist < y.assist) return 1;
      if (x.save > y.save) return -1;
      if (x.save < y.save) return 1;
    }
    if (port === "assist") {
      if (x.assist > y.assist) return -1;
      if (x.assist < y.assist) return 1;
      if (x.mp < y.mp) return -1;
      if (x.mp > y.mp) return 1;
      if (x.goal > y.goal) return -1;
      if (x.goal < y.goal) return 1;
      if (x.save > y.save) return -1;
      if (x.save < y.save) return 1;
    }
    if (port === "keeper") {
      if (x.saves > y.saves) return -1;
      if (x.saves < y.saves) return 1;
      if (x.mp < y.mp) return -1;
      if (x.mp > y.mp) return 1;
      if (x.goal > y.goal) return -1;
      if (x.goal < y.goal) return 1;
      if (x.assist > y.assist) return -1;
      if (x.assist < y.assist) return 1;
    }
    if (port === "table") {
      if (x.pts > y.pts) return -1;
      if (x.pts < y.pts) return 1;
      if (x.pld < y.pld) return -1;
      if (x.pld > y.pld) return 1;
      if (x.gd > y.gd) return -1;
      if (x.gd < y.gd) return 1;
      if (x.gf > y.gf) return -1;
      if (x.gf < y.gf) return 1;
      if (x.w > y.w) return -1;
      if (x.w < y.w) return 1;
      if (x.ga < y.ga) return -1;
      if (x.ga > y.ga) return 1;
      if (x.l < y.l) return -1;
      if (x.l > y.l) return 1;
    }
  });
  if (item.length > len) item.length = len;
  return item;
};
// get random valuesbetween two numbers
module.exports.randomValue = (max, min) => Math.floor(Math.random() * (max - min + 1) + min);
