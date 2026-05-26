import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    groupMessages: [],
    isGroupsLoading: false,
    isGroupMessagesLoading: false,

    getMyGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups/my-groups");
            set({ groups: Array.isArray(res.data) ? res.data : [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load groups");
            set({ groups: [] });
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    createGroup: async (groupData) => {
        try {
            const res = await axiosInstance.post("/groups/create", groupData);
            set({ groups: [...get().groups, res.data] });
            toast.success("Group created!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create group");
        }
    },

    getGroupMessages: async (groupId) => {
        set({ isGroupMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/messages`);
            set({ groupMessages: Array.isArray(res.data) ? res.data : [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load messages");
            set({ groupMessages: [] });
        } finally {
            set({ isGroupMessagesLoading: false });
        }
    },

    sendGroupMessage: async (messageData) => {
        const { selectedGroup, groupMessages } = get();
        try {
            const res = await axiosInstance.post(
                `/groups/${selectedGroup._id}/send`,
                messageData
            );
            set({ groupMessages: [...groupMessages, res.data] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    leaveGroup: async (groupId) => {
        try {
            await axiosInstance.post(`/groups/${groupId}/leave`);
            set({
                groups: get().groups.filter((g) => g._id !== groupId),
                selectedGroup: null,
                groupMessages: [],
            });
            toast.success("Left group");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave group");
        }
    },

    subscribeToGroupMessages: () => {
        const { selectedGroup } = get();
        if (!selectedGroup) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newGroupMessage", ({ groupId, message }) => {
            if (groupId !== get().selectedGroup?._id) return;
            set({ groupMessages: [...get().groupMessages, message] });
        });
    },

    unsubscribeFromGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newGroupMessage");
    },

    setSelectedGroup: (group) =>
        set({ selectedGroup: group, groupMessages: [] }),
}));