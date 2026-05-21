import { X, Users, LogOut } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";

const GroupChatHeader = () => {
  const { selectedGroup, setSelectedGroup, leaveGroup } = useGroupStore();
  const { authUser } = useAuthStore();

  const isAdmin =
    selectedGroup?.admin?._id === authUser._id ||
    selectedGroup?.admin === authUser._id;

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this group?")) {
      await leaveGroup(selectedGroup._id);
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="size-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {selectedGroup?.groupPic ? (
                <img src={selectedGroup.groupPic} alt={selectedGroup.name} />
              ) : (
                <Users className="size-5" />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedGroup?.name}</h3>
            <p className="text-sm text-base-content/70">
              {selectedGroup?.members?.length} members
              {isAdmin && " · Admin"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleLeave}
            className="btn btn-ghost btn-sm btn-circle text-error"
            title="Leave group"
          >
            <LogOut className="size-4" />
          </button>
          <button
            onClick={() => setSelectedGroup(null)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatHeader;