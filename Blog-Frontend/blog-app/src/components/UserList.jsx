import { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://clone-project01-cvraljpgd-abhiii966s-projects.vercel.app/admin-api/users/user", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUsers(res.data.payload);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    if (!window.confirm(newStatus ? "Activate this user?" : "Block this user?")) return;

    try {
      const res = await axios.patch(
        "http://localhost:6677/admin-api/users",
        { userId, isUserActive: newStatus },
        { withCredentials: true }
      );
      if (res.status === 201) {
        setUsers((prev) =>
          prev.map((u) => u._id === userId ? { ...u, isUserActive: newStatus } : u)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="p-3 border">{user.firstName} {user.lastName}</td>
              <td className="p-3 border">{user.email}</td>
              <td className="p-3 border">
                <span className={user.isUserActive ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {user.isUserActive ? "Active" : "Blocked"}
                </span>
              </td>
              <td className="p-3 border">
                <button
                  onClick={() => toggleUserStatus(user._id, user.isUserActive)}
                  className={`px-4 py-1 rounded-full text-white text-xs ${
                    user.isUserActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {user.isUserActive ? "Block" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
