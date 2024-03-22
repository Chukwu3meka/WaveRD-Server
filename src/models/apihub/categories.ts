import { Schema } from "mongoose";

import { apihubDatabase } from "../database";
import { ObjectId } from "mongodb";

const CategoriesSchema = new Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: ObjectId, required: true },
  updated: { type: Date, default: new Date() },
});

const CategoryModel = apihubDatabase.model("Categories", CategoriesSchema);

export default CategoryModel;
