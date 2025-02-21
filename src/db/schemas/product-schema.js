import { Schema } from 'mongoose';
const shortId = require('./types/short-id');

const ProductSchema = new Schema(
  {
    shortId,
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'categories',
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    detailImage: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    collection: 'products',
    timestamps: true,
  }
);

export { ProductSchema };
