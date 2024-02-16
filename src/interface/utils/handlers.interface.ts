export interface PreventProfileBruteForce {
  profile: any;
  password: string | false;
}

export interface RequestHasBody {
  required: string[];
  sendError?: boolean;
  body: { [key: string]: any };
}

export interface CalcFutureDate {
  context: "days" | "hours";
  interval: number;
}
