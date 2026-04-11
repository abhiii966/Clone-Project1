import { useEffect, useState } from "react";
import axios from "axios";

function AuthorList() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAuthors = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:6677/admin-api/users/author", {
          withCredentials: true,
        });
        if (res.status === 200) {
          // filter only authors
          setAuthors(res.data.payload);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch authors");
      } finally {
        setLoading(false);
      }
    };

    getAuthors();
  }, []);

  const toggleAuthorStatus = async (authorId, currentStatus) => {
    const newStatus = !currentStatus;
    const confirmMsg = newStatus ? "Activate this author?" : "Block this author?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(
        "http://localhost:6677/admin-api/users",
        { userId: authorId, isUserActive: newStatus },
        { withCredentials: true }
      );
      if (res.status === 201) {
        setAuthors((prev) =>
          prev.map((a) =>
            a._id === authorId ? { ...a, isUserActive: newStatus } : a
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p>Loading authors...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (authors.length === 0) return <p>No authors found.</p>;

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
          {authors.map((author) => (
            <tr key={author._id} className="border-t">
              <td className="p-3 border">{author.firstName} {author.lastName}</td>
              <td className="p-3 border">{author.email}</td>
              <td className="p-3 border">
                <span className={author.isUserActive ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {author.isUserActive ? "Active" : "Blocked"}
                </span>
              </td>
              <td className="p-3 border">
                <button
                  onClick={() => toggleAuthorStatus(author._id, author.isUserActive)}
                  className={`px-4 py-1 rounded-full text-white text-xs ${
                    author.isUserActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {author.isUserActive ? "Block" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuthorList;