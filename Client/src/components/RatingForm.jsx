import React, { useEffect, useState } from "react";

const RatingForm = () => {
  const [allContractors, setAllContractors] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredContractors, setFilteredContractors] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [rating, setRating] = useState(0); 
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5050/contractors")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contractors");
        return res.json();
      })
      .then((data) => {
        setAllContractors(data);
      })
      .catch((err) => {
        console.error("Failed to load contractors", err);
        setError("Failed to load contractors list.");
      });
  }, []);

  const handleSearchChange = (e) => {
    const currentSearchTerm = e.target.value;
    setSearchTerm(currentSearchTerm);
    setSelectedContractorId(""); 

    if (currentSearchTerm.trim() === "") {
      setFilteredContractors([]);
      setShowSuggestions(false);
    } else {
      const filtered = allContractors.filter(
        (contractor) =>
          `${contractor.firstName} ${contractor.lastName}`
            .toLowerCase()
            .includes(currentSearchTerm.toLowerCase()) ||
          (contractor.organizationName &&
            contractor.organizationName
              .toLowerCase()
              .includes(currentSearchTerm.toLowerCase()))
      );
      setFilteredContractors(filtered);
      setShowSuggestions(true);
    }
  };

  const handleContractorSelect = (contractor) => {
    setSelectedContractorId(contractor._id);
    setSearchTerm(`${contractor.firstName} ${contractor.lastName}${contractor.organizationName ? ` (${contractor.organizationName})` : ''}`);
    setFilteredContractors([]); 
    setShowSuggestions(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    if (!userId) {
      setError("You must be logged in to submit a rating.");
      return;
    }

    if (!selectedContractorId) {
      setError("Please select a contractor from the search results.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please enter a valid rating (1–5).");
      return;
    }


    try {
      const res = await fetch("http://localhost:5050/rating-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          contractorId: selectedContractorId,
          rating: Number(rating), 
          comment,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setRating(0); 
        setComment("");
        setSearchTerm(""); 
        setSelectedContractorId(""); 
      } else {
        const errData = await res.json().catch(() => ({ message: "An unknown error occurred." }));
        throw new Error(errData.message || `Server responded with ${res.status}`);
      }
    } catch (err) {
      console.error("Rating submission error:", err);
      setError(err.message || "Failed to submit rating. Please try again later.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center text-blue-600">Rate a Contractor</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="contractorSearch" className="block text-sm font-medium mb-1 text-gray-700">
            Search and Select Contractor
          </label>
          <input
            id="contractorSearch"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => { if (searchTerm) setShowSuggestions(true);}}
            placeholder="Type contractor name or organization..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {showSuggestions && filteredContractors.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filteredContractors.map((contractor) => (
                <li
                  key={contractor._id}
                  onClick={() => handleContractorSelect(contractor)}
                  className="p-3 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  {contractor.firstName} {contractor.lastName}
                  {contractor.organizationName && (
                    <span className="text-xs text-gray-500 ml-2">({contractor.organizationName})</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && searchTerm && filteredContractors.length === 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 p-3 text-sm text-gray-500 shadow-lg">
              No contractors found matching "{searchTerm}"
            </div>
          )}
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-1 text-gray-700">
            Rating (1 to 5)
          </label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="1" 
            value={rating === 0 ? "" : rating} 
            onChange={(e) => setRating(e.target.value === "" ? 0 : parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-1 text-gray-700">Comment (Optional)</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Write your feedback here..."
          ></textarea>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
            Rating submitted successfully! Thank you for your feedback.
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
        >
          Submit Rating
        </button>
      </form>
    </div>
  );
};

export default RatingForm;