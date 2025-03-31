import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // A playlist must have a name
      maxlength: 100, // Limit name length
    },
    description: {
      type: String,
      maxlength: 500, 
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video", 
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true, 
    },
  },
  { timestamps: true } 
);

playlistSchema.plugin(mongooseAggregatePaginate);

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
