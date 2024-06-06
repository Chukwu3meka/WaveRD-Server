// ? Wave Research Development Web
const devOrigins = [
  "http://localhost:8081",
  // "http://localhost:3001",
  // "http://localhost:3000",
  //
];

// ? Wave Research Production
// const prodOrigins = [
//   // "https://www.waverd.com", // "https://.waverd.com",
//   "https://waverd.com",
//   "https://www.waverd.com",
//   "https://dev.waverd.com",
// ];
const prodOrigins = ["https://waverd.com", /\.waverd\.com$/];

const corsOptions = {
  credentials: true,
  methods: ["GET, POST, PUT, DELETE, OPTIONS"],
  origin: process.env.NODE_ENV === "production" ? prodOrigins : devOrigins,
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default corsOptions;
