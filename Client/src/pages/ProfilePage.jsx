import { useEffect, useState } from "react";

const ProfilePage = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchUserRatings() {
      try {
        const response = await fetch(`http://localhost:5050/rating-post/user/${userId}`);
        const data = await response.json();
        setRatings(data);
      } catch (err) {
        console.error("Failed to fetch ratings:", err);
        setError("Failed to load ratings.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserRatings();
      console.log(ratings);
    } else {
      setError("No user ID found.");
      setLoading(false);
    }
  }, [userId]);

  const handleDelete = async (ratingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this rating?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5050/rating-post/${ratingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRatings((prev) => prev.filter((r) => r._id !== ratingId));
      } else {
        console.error("Failed to delete rating");
      }
    } catch (err) {
      console.error("Error deleting rating:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading ratings...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">My Ratings</h2>

      {ratings.length === 0 ? (
        <p className="text-gray-600">You haven't posted any ratings yet.</p>
      ) : (
        <ul className="space-y-4">
          {ratings.map((rating) => (
            <li
              key={rating._id}
              className="border border-gray-200 rounded p-4 flex justify-between items-start"
            >
              <div>
                <p className="text-lg font-medium text-blue-800">
                    Contractor: {rating.contractor ? `${rating.contractor.firstName} ${rating.contractor.lastName}` : "Unknown"}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Rating: ⭐ {rating.rating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  "{rating.comment || "No comment provided."}"
                </p>
              </div>
              <button
                onClick={() => handleDelete(rating._id)}
                className="text-red-600 hover:underline text-sm ml-4"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfilePage;
