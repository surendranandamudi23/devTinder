const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const userRouter = express.Router();
const USER_SAFE_DATA_TO_SEND =
  "firstName lastName  age gender skills about photoUrl";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedUser?._id,
      status: "intrested",
    }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);
    if (pendingRequests?.length === 0) {
      res.status(404).json({
        message: "No request found",
      });
    }
    res.json({
      message: "Requests found",
      data: pendingRequests,
    });
  } catch (err) {
    res.status(400).send(`Error : ${err?.message || "Something went wrong"}`);
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    const connectedUsers = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: loggedUser?._id }, { toUserId: loggedUser?._id }],
    })
      .populate("fromUserId", USER_SAFE_DATA_TO_SEND)
      .populate("toUserId", USER_SAFE_DATA_TO_SEND);

    const data = connectedUsers.map((user) => {
      if (user?.fromUserId._id.equals(loggedUser?._id)) {
        return user?.toUserId;
      }
      return user?.fromUserId;
    });

    res.json({
      message: "Connected users",
      data,
    });
  } catch (err) {
    res.status(400).send(`Error : ${err?.message || "Something went wrong"}`);
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req?.user;
    const allNotificationId = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: loggedInUser._id,
        },
        {
          toUserId: loggedInUser._id,
        },
      ],
    }).select("fromUserId toUserId");
    // .populate("fromUserId", USER_SAFE_DATA_TO_SEND);

    const newMap = new Set();
    allNotificationId.forEach((res) => {
      newMap.add(res?.toUserId);
      newMap.add(res?.fromUserId);
    });
    const feed = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(newMap) },
        },
        {
          _id: { $ne: loggedInUser?._id },
        },
      ],
    }).select(USER_SAFE_DATA_TO_SEND);
    res.json({
      data: feed,
    });
  } catch (err) {
    res.status(400).send(`Error : ${err?.message || "Something went wrong"}`);
  }
});

module.exports = { userRouter };
