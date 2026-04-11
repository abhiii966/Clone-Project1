import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function AdminProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* PROFILE HEADER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-semibold">
            {currentUser?.firstName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-500">Admin Panel</p>
            <h2 className="text-xl font-semibold">{currentUser?.firstName}</h2>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white text-sm px-5 py-2 rounded-full hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminProfile;