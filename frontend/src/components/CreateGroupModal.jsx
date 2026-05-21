import { useState } from "react";
import { X, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const CreateGroupModal = ({ onClose }) => {
  const { users } = useChatStore();
  const { createGroup } = useGroupStore();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setIsLoading(true);
    await createGroup({
      name: groupName.trim(),
      description: description.trim(),
      memberIds: selectedMembers,
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <h2 className="text-lg font-semibold">Create New Group</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="label text-sm font-medium">Group Name *</label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div>
            <label className="label text-sm font-medium">
              Description (optional)
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label text-sm font-medium">
              Add Members ({selectedMembers.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 border border-base-300 rounded-lg p-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleMember(user._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                    selectedMembers.includes(user._id) ? "bg-primary/10" : ""
                  }`}
                >
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="size-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium flex-1">
                    {user.fullName}
                  </span>
                  {selectedMembers.includes(user._id) && (
                    <div className="size-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-content text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-base-300">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || isLoading}
            className="btn btn-primary flex-1"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;