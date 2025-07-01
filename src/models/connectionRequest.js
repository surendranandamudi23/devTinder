const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "intrested", "accepted", "rejected"],
        message: `{VALUE} is invalid status`,
      },

      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
// Compound index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
connectionRequestSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot send connection request to yourself");
  }
  if (this.status) {
    this.status = this.status.toLowerCase().trim();
  }
  next();
});
module.exports = ConnectionRequest;
