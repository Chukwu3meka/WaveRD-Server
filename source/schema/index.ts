import mongoose from "mongoose";

const v1MongoDB = mongoose.createConnection(process.env.V1_MONGODB_URI as string);
const apiMongoDB = mongoose.createConnection(process.env.API_MONGODB_URI as string);

export default mongoose;
