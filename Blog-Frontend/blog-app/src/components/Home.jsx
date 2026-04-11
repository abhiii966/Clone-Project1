import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import axios from "axios";
import { useEffect, useState } from "react";
import UserList from "./UserList";
import AuthorList from "./AuthorList";

import {
  articleGrid,
  articleCardClass,
  articleTitle,
  ghostBtn,
  loadingClass,
  errorClass,
  timestampClass,
} from "../styles/common.js";

function Home() {
  const logout = useAuth((state) => state.logout);
  const currentUser = useAuth((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // don't fetch articles for admin
    if (currentUser?.role === "ADMIN" || currentUser?.role === "admin") return;

    const getArticles = async () => {
      setLoading(true);
      try {
        let res = await axios.get("http://localhost:6677/user-api/articles", { withCredentials: true })
        if (res.status === 200) {
          setArticles(res.data.payload)
        }
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, [currentUser]);

  const formatDateIST = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const navigateToArticleByID = (articleObj) => {
    navigate(`/article/${articleObj._id}`, { state: articleObj });
  };

  if (loading) return <p className={loadingClass}>Loading...</p>;

// ADMIN VIEW
if (currentUser?.role === "ADMIN" || currentUser?.role === "admin") {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Admin Dashboard</h2>
      
      {/* TABS */}
      <div className="flex gap-3 mb-6 bg-[#f5f5f7] p-2 rounded-full w-fit">
        <button
          onClick={() => setActiveTab("users")}
          className={activeTab === "users"
            ? "bg-white px-5 py-2 rounded-full text-[#0066cc] text-sm font-medium shadow-sm"
            : "px-5 py-2 text-sm text-gray-500"}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("authors")}
          className={activeTab === "authors"
            ? "bg-white px-5 py-2 rounded-full text-[#0066cc] text-sm font-medium shadow-sm"
            : "px-5 py-2 text-sm text-gray-500"}
        >
          Authors
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "users" ? <UserList /> : <AuthorList />}
    </div>
  );
}

  // REGULAR VIEW
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Latest Articles</h3>

        {articles.length === 0 ? (
          <p className="text-[#a1a1a6] text-sm text-center py-10">No articles available yet</p>
        ) : (
          <div className={articleGrid}>
            {articles.map((articleObj) => (
              <div className={articleCardClass} key={articleObj._id}>
                <div className="flex flex-col h-full">
                  <div>
                    <p className={articleTitle}>{articleObj.title}</p>
                    <p className="text-sm text-[#6e6e73] mt-1">{articleObj.content.slice(0, 80)}...</p>
                    <p className={`${timestampClass} mt-2`}>{formatDateIST(articleObj.createdAt)}</p>
                  </div>
                  <button className={`${ghostBtn} mt-auto pt-4`} onClick={() => navigateToArticleByID(articleObj)}>
                    Read Article →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;