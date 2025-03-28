import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true, // Content is mandatory
      maxlength: 280
    },
  },
  { timestamps: true } 
);
tweetSchema.plugin(mongooseAggregatePaginate);

const Tweet = mongoose.model("Tweet", tweetSchema);
export default Tweet;
