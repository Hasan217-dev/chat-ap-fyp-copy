import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageSquare, Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { getMyGroups, groups, selectedGroup, setSelectedGroup, isGroupsLoading } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
    getMyGroups();
  }, [getUsers, getMyGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        {/* Tabs */}
        <div className="border-b border-base-300 w-full">
          <div className="flex">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-colors
                ${activeTab === "chats" ? "border-b-2 border-primary text-primary" : "text-base-content/60 hover:text-base-content"}`}
            >
              <MessageSquare className="size-4" />
              <span className="hidden lg:block">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-colors
                ${activeTab === "groups" ? "border-b-2 border-primary text-primary" : "text-base-content/60 hover:text-base-content"}`}
            >
              <Users className="size-4" />
              <span className="hidden lg:block">Groups</span>
            </button>
          </div>
        </div>

        {/* Chats Tab */}
        {activeTab === "chats" && (
          <>
            <div className="border-b border-base-300 w-full p-4">
              <div className="hidden lg:flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm">Show online only</span>
                </label>
                <span className="text-xs text-zinc-500">
                  ({onlineUsers.length - 1} online)
                </span>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-3">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedGroup(null);
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                    ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center text-zinc-500 py-4">No online users</div>
              )}
            </div>
          </>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <>
            <div className="border-b border-base-300 w-full p-4 flex items-center justify-between">
              <span className="hidden lg:block text-sm font-medium">
                My Groups ({groups.length})
              </span>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="btn btn-primary btn-sm gap-1"
              >
                <Plus className="size-4" />
                <span className="hidden lg:block">New Group</span>
              </button>
            </div>

            <div className="overflow-y-auto w-full py-3">
              {isGroupsLoading ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner" />
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center text-zinc-500 py-8 px-4">
                  <Users className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No groups yet</p>
                  <p className="text-xs mt-1 opacity-60">Create one to get started</p>
                </div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedUser(null);
                    }}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
                      ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
                  >
                    <div className="relative mx-auto lg:mx-0">
                      <div className="size-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                        {group.groupPic ? (
                          <img
                            src={group.groupPic}
                            alt={group.name}
                            className="size-12 object-cover rounded-full"
                          />
                        ) : (
                          <Users className="size-5" />
                        )}
                      </div>
                    </div>
                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-sm text-zinc-400">
                        {group.members?.length} members
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </>
  );
};

export default Sidebar;