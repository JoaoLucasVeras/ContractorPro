import React, { useEffect, useState } from "react";

const ContractorProfile = ({ contractor }) => {
  const [jobTypesData, setJobTypesData] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    // Fetch job types
    fetch("http://localhost:5050/job-types")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          const flattened = Object.values(data).flat();
          setJobTypesData(flattened);
        } else {
          console.error("Invalid job types data format:", data);
        }
      })
      .catch((err) => console.error("Error fetching job types:", err));
  }, []);

  useEffect(() => {
    if (contractor && contractor._id) {
      // Fetch ratings for this contractor
      fetch(`http://localhost:5050/rating-post/contractor/${contractor._id}`)
        .then((res) => res.json())
        .then((data) => setRatings(data))
        .catch((err) => console.error("Error fetching ratings:", err));
    }
  }, [contractor]);

  if (!contractor) {
    return <p>No contractor data provided.</p>;
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    rating,
    photo,
    jobTypes = [],
  } = contractor;

  const jobNames = jobTypes.map((jobId) => {
    const job = jobTypesData.find((jt) => jt._id === jobId);
    return job ? job.jobName : "Unknown Job Type";
  });

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img
          src={photo}
          alt="Contractor Profile"
          className="w-36 h-36 rounded-full object-cover border-2 border-gray-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150";
          }}
        />

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">
            {firstName} {lastName}
          </h2>
          <p className="text-sm text-gray-800">
            <strong>Email:</strong> {email}
          </p>
          <p className="text-sm text-gray-800">
            <strong>Phone:</strong> {phone || "Not Provided"}
          </p>

          <div className="mt-3">
            <p className="text-sm text-gray-800 font-semibold">
              Rating:
              <span className="text-xl text-yellow-500 font-bold ml-2">
                {rating ? rating.toFixed(1) : "N/A"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {jobNames.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Job Types</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {jobNames.map((jobName, index) => (
              <li
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {jobName}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">User Ratings</h3>
        {ratings.length === 0 ? (
          <p className="text-gray-500">No ratings yet.</p>
        ) : (
          <ul className="space-y-4">
            {ratings.map((r) => (
              <li key={r._id} className="border p-4 rounded-md shadow-sm">
                <p className="text-sm text-gray-800">
                  <strong>Rating:</strong>{" "}
                  <span className="text-yellow-500 font-bold">{r.rating}/5</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>By:</strong> {r.user?.username || "Anonymous"}
                </p>
                <p className="text-gray-700 mt-1 italic">"{r.comment}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContractorProfile;
