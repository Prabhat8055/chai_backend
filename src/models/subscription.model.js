import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subsciber: {
      type: Schema.Types.ObjectId, //one who is subscription
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //one whom  subscriber is subscribing
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
