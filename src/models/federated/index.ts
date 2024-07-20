import { federatedDatabase } from "../database";
import { GAMES_CLUB } from "../games";

const FED_GAMES_CLUBS = federatedDatabase.model("games_clubs", GAMES_CLUB.schema);

export { FED_GAMES_CLUBS };
