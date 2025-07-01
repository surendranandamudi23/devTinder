const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const { status } = req.params;
      const { userId } = req.params;
      const { _id } = req.user;
      if (status !== "ignored" && status !== "intrested") {
        throw new Error("Invalid status");
      }
      const toUserId = await User.findById(userId);
      if (!toUserId) {
        throw new Error("User not found");
      }
      // Existing request
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: userId, toUserId: _id },
          { fromUserId: _id, toUserId: userId },
        ],
      });
      if (existingRequest) {
        throw new Error("Request already sent");
      }
      const request = new ConnectionRequest({
        fromUserId: _id,
        toUserId: userId,
        status: status,
      });
      const result = await request.save();
      res.json({
        message: "Request sent successfully",
        data: result,
      });
    } catch (err) {
      res.status(400).json({
        message: err?.message || "Something went wrong",
      });
    }
  }
);
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status } = req.params;
      const { requestId } = req.params;
      if (status !== "accepted" && status !== "rejected") {
        throw new Error("Invalid status");
      }
      const request = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: req.user._id,
        status: "intrested",
      });
      if (!request) {
        throw new Error("Request not found");
      }
      request.status = status;
      const result = await request.save();
      res.json({
        message: "Request updated successfully",
        data: result,
      });
    } catch (err) {
      res.status(400).json({
        message: err?.message || "Something went wrong",
      });
    }
  }
);

module.exports = { requestRouter };
