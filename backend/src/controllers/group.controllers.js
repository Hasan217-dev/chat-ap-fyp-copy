import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import cloudinary from "cloudinary";
import { io, userSocketMap } from "../lib/socket.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const adminId = req.user._id;

    if (!name) return res.status(400).json({ error: "Group name is required" });

    // Always include admin as a member
    const members = [...new Set([adminId.toString(), ...(memberIds || [])])];

    const newGroup = new Group({
      name,
      description,
      admin: adminId,
      members,
    });

    await newGroup.save();

    const populated = await newGroup.populate("members", "-password");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all groups for logged-in user
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId }).populate(
      "members",
      "-password"
    );
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getMyGroups:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (!isMember) return res.status(403).json({ error: "Not a member" });

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send message to a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const isMember = group.members.some(
      (m) => m.toString() === senderId.toString()
    );
    if (!isMember) return res.status(403).json({ error: "Not a member" });

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic");

    // Emit to all group members via socket
    group.members.forEach((memberId) => {
      const socketId = userSocketMap[memberId.toString()];
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", {
          groupId,
          message: newMessage,
        });
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add member to group (admin only)
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const adminId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.admin.toString() !== adminId.toString())
      return res.status(403).json({ error: "Only admin can add members" });

    if (group.members.includes(userId))
      return res.status(400).json({ error: "User already a member" });

    group.members.push(userId);
    await group.save();

    const populated = await group.populate("members", "-password");
    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in addMember:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter(
      (m) => m.toString() !== userId.toString()
    );

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res
        .status(200)
        .json({ message: "Group deleted as no members left" });
    }

    // If admin leaves, assign new admin
    if (group.admin.toString() === userId.toString()) {
      group.admin = group.members[0];
    }

    await group.save();
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};