import React, { useEffect, useState } from "react";

// Define a placeholder image URL for contractors without a photo
// Updated to use dummyimage.com which is generally reliable
const DEFAULT_PLACEHOLDER_IMAGE = "https://dummyimage.com/150x150/cccccc/000000.png&text=No+Image";

export default function Home() {
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    async function fetchContractors() {
      try {
        const response = await fetch("http://localhost:5050/contractors/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Helper function to score contractors for sorting
        const getContractorPriorityScore = (contractor) => {
          const hasPhoto = contractor.photo && contractor.photo.trim() !== "";
          // Consider a rating valid if it's a number and greater than 0
          const hasValidRating = contractor.rating && parseFloat(contractor.rating) > 0;

          if (hasPhoto && hasValidRating) return 3; // Highest priority: photo and rating
          if (hasValidRating) return 2; // Next: rating only
          if (hasPhoto) return 1; // Next: photo only
          return 0; // Lowest priority
        };

        // Sort the contractors
        const sortedData = data.sort((a, b) => {
          const scoreA = getContractorPriorityScore(a);
          const scoreB = getContractorPriorityScore(b);

          // Sort by score descending (higher score comes first)
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }

          // If scores are the same, and both have valid ratings, sort by rating descending
          if ((scoreA === 3 || scoreA === 2) && (scoreB === 3 || scoreB === 2)) {
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            if (ratingB !== ratingA) {
              return ratingB - ratingA;
            }
          }

          // Fallback: sort by name alphabetically for consistent ordering
          const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase().trim();
          const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase().trim();
          
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          
          return 0;
        });

        setContractors(sortedData);
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
        // Optionally set an error state here to display to the user
      }
    }

    fetchContractors();
  }, []);

  // Display only the first 3 contractors from the sorted list
  const contractorsToDisplay = contractors.slice(0, 3);

  return (
    <div className="flex flex-wrap justify-center p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Left Column: Contractors List */}
      <div className="w-full md:w-2/3 md:pr-6 mb-8 md:mb-0">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-8 text-center text-blue-900">
          Find Your Perfect Contractor
        </h1>

        {/* Display Contractors in Separate Containers */}
        {contractorsToDisplay.length > 0 ? (
          <div className="space-y-8">
            {contractorsToDisplay.map((c) => (
              <div
                key={c._id}
                className="bg-white shadow-xl rounded-lg p-6 flex flex-col sm:flex-row items-center sm:items-start hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Image Section */}
                <div className="w-32 h-32 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                  <img
                    src={c.photo || DEFAULT_PLACEHOLDER_IMAGE}
                    alt={`${c.firstName} ${c.lastName}`}
                    className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => { 
                      e.target.onerror = null; // Prevents infinite loop if placeholder itself is broken
                      e.target.src = DEFAULT_PLACEHOLDER_IMAGE; 
                    }}
                  />
                </div>

                {/* Contractor Info Section */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-blue-800">
                    {`${c.firstName} ${c.lastName}`}
                  </h2>
                  {c.organizationName && (
                     <p className="text-md mt-1 text-gray-700">{c.organizationName}</p>
                  )}
                  {c.specialization && (
                    <p className="text-sm text-indigo-600 mt-1">{c.specialization}</p>
                  )}
                </div>

                {/* Rating Section */}
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-right flex-shrink-0">
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <div className="text-yellow-500 font-bold text-lg">
                    {c.rating && parseFloat(c.rating) > 0
                      ? `⭐ ${parseFloat(c.rating).toFixed(1)}`
                      : <span className="text-gray-400 text-sm">Not Rated</span>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading contractors or no contractors found.</p>
        )}


        {/* Call-to-Action Button to see all contractors */}
        <div className="text-center mt-12">
          <a
            href="/register" 
            className="bg-blue-600 text-white text-lg px-8 py-3 rounded-full shadow-md hover:bg-blue-700 transition duration-200"
          >
            Browse All Contractors
          </a>
        </div>
      </div>

      {/* Right Column: Join Today Call-to-Action */}
      <div className="w-full md:w-1/3 md:pl-6">
        <div className="bg-white shadow-xl rounded-lg p-8 sticky top-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Join Contractor Connect Today!
          </h2>
          <p className="text-gray-700 mb-4">
            Whether you're a contractor looking to expand your reach or a
            homeowner searching for the perfect professional for your project,
            Contractor Connect is the perfect platform for you.
          </p>
          <p className="text-gray-700 mb-6">
            Sign up today to start connecting with qualified contractors or to
            list your services and get discovered by potential clients. It's
            fast, free, and easy!
          </p>

          {/* Call to Action Buttons */}
          <div className="space-y-4 mt-6">
            <a
              href="/register"
              className="block w-full text-center bg-blue-600 text-white text-md px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              Register as a Contractor
            </a>
            <a
              href="/register" 
              className="block w-full text-center bg-green-500 text-white text-md px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200"
            >
              Sign Up to Find Contractors
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}