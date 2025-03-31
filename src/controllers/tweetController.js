import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"


const createTweet = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id; 

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Create and save the tweet
    const newTweet = new Tweet({
      owner: userId,
      content,
    });

    await newTweet.save();

    res.status(201).json({ message: "Tweet created successfully", tweet: newTweet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getUserTweets = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const tweets = await Tweet.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullname: 1,
                                username: 1,
                                avatar: 1
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    },
                },
            },
            { 
            $project:{
                content:1,
                owner:1,
                createdAt:1
            }

            },
            {
                $skip: (page - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
        ]);

        res.status(200).json({ tweets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

  
  

const updateTweet = (req, res) => {
    //TODO: update tweet
}

const deleteTweet =async (req, res) => {
    //TODO: delete tweet
}

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getUserTweet
}