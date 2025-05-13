import { useEffect, useState } from "react";
import ContractorProfile from "../pages/ContractorProfile"; // adjust path if necessary

const JobSearch = () => {
  const [jobData, setJobData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [selectedContractor, setSelectedContractor] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5050/job-types")
      .then((res) => res.json())
      .then((data) => setJobData(data))
      .catch((err) => console.error("Error fetching job types:", err));
  }, []);

  const fetchContractors = (jobId) => {
    fetch(`http://localhost:5050/contractors/by-job-type/${jobId}`)
      .then((res) => res.json())
      .then((data) => setContractors(data))
      .catch((err) => console.error("Error fetching contractors:", err));
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setSelectedContractor(null); // Reset selected contractor when a new job is clicked
    fetchContractors(job._id);
  };

  const handleContractorClick = (contractor) => {
    setSelectedContractor(contractor);
  };

  // Assuming jobData is an object where keys are categories
  // and values are arrays of job objects
  const categories = Object.keys(jobData);

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full max-w-4xl mx-auto">
      <p className="text-gray-700 mb-2">
        Please select a category from the dropdown below to browse available job
        types:
      </p>

      <select
        className="w-full p-2 border rounded mb-4"
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(e.target.value);
          setSelectedJob(null); // Reset selected job when category changes
          setContractors([]); // Clear contractors list
          setSelectedContractor(null); // Clear selected contractor
        }}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {selectedCategory && jobData[selectedCategory] && (
        <ul className="space-y-2 mb-4">
          {jobData[selectedCategory].map((job, idx) => (
            <li
              key={job._id || idx} // Use job._id if available, otherwise fallback to idx
              onClick={() => handleJobClick(job)}
              className={`p-3 rounded cursor-pointer transition ${
                selectedJob && selectedJob._id === job._id
                  ? "bg-blue-200"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <strong>{job.jobName}</strong>
              <p className="text-sm">{job.description}</p>
            </li>
          ))}
        </ul>
      )}

      {selectedJob && !selectedContractor && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Contractors for "{selectedJob.jobName}"
          </h3>
          {contractors.length === 0 ? (
            <p className="text-sm text-gray-600">No contractors found for this job type.</p>
          ) : (
            <ul className="space-y-3"> {/* Increased space-y for better separation */}
              {contractors.map((contractor) => (
                <li
                  key={contractor._id}
                  onClick={() => handleContractorClick(contractor)}
                  className={`p-4 rounded-lg cursor-pointer transition border ${ // Increased padding, added border
                    selectedContractor && selectedContractor._id === contractor._id
                      ? "bg-blue-100 border-blue-400 shadow-md" // Enhanced selected style
                      : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm" // Default card-like style
                  }`}
                >
                  <p className="font-semibold text-lg text-blue-700"> {/* Made name slightly larger and colored */}
                    {contractor.firstName} {contractor.lastName}
                  </p>
                  {contractor.organizationName && (
                    <p className="text-sm text-gray-600">{contractor.organizationName}</p>
                  )}
                  {/* The specialization field might be undefined if not in your data */}
                  {/* Ensure your contractor objects actually have a 'specialization' field */}
                  {contractor.specialization && (
                     <p className="text-sm text-indigo-600">{contractor.specialization}</p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Email:</span> {contractor.email ?? "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Phone:</span> {contractor.phone ?? "N/A"}
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    Rating: ⭐ {contractor.rating?.toFixed(1) ?? "N/A"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Show Contractor Profile */}
      {selectedContractor && (
        <div className="mt-8">
          <ContractorProfile contractor={selectedContractor} />
          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedContractor(null)}
              className="text-blue-600 hover:underline"
            >
              ← Back to list
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;