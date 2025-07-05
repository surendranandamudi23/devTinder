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
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Enforce min/max bounds
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;
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

    const newMap = new Set([loggedInUser?._id?.toString()]);
    allNotificationId.forEach((res) => {
      newMap.add(res?.toUserId);
      newMap.add(res?.fromUserId);
    });
    const query = { _id: { $nin: Array.from(newMap) } };
    const totalCount = await User.countDocuments(query);
    const feed = await User.find({
      _id: { $nin: Array.from(newMap) },
    }).select(USER_SAFE_DATA_TO_SEND);
    res.json({
      data: feed,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(400).send(`Error : ${err?.message || "Something went wrong"}`);
  }
});

module.exports = { userRouter };
