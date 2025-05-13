import { useEffect, useState } from "react";

const RegisterContractor = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organizationName: "",
    phone: "",
    email: "",
    photo: "",
    jobTypes: [], // Stores array of selected job _id strings
  });

  // State to store job types grouped by category
  const [jobCategoriesData, setJobCategoriesData] = useState({});
  // State to manage which categories are expanded
  const [openCategories, setOpenCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5050/job-types") // Endpoint should return {"CategoryA": [jobs...], "CategoryB": [jobs...]}
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Assuming data is already in the correct categorized format
        // Perform a light validation/filtering if necessary
        const validData = {};
        for (const category in data) {
          if (Object.prototype.hasOwnProperty.call(data, category) && Array.isArray(data[category])) {
            // Filter for valid job objects within each category
            validData[category] = data[category].filter(job => job && job._id && job.jobName);
          }
        }
        setJobCategoriesData(validData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch job types:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // job object passed here should have _id
  const toggleJobSelection = (job) => {
    const jobId = job._id; // Ensure job object has _id
    const selectedJobIds = formData.jobTypes;
    const updatedJobs = selectedJobIds.includes(jobId)
      ? selectedJobIds.filter((id) => id !== jobId)
      : [...selectedJobIds, jobId];
    setFormData((prev) => ({ ...prev, jobTypes: updatedJobs }));
  };

  const toggleCategoryOpen = (categoryName) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to register a contractor.");
      return;
    }

    const payload = {
      ...formData,
      userId, // Ensure your backend expects userId directly or wrapped in an object if needed
    };

    fetch("http://localhost:5050/contractors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          alert("Contractor registered successfully");
          setFormData({ // Reset form
            firstName: "",
            lastName: "",
            organizationName: "",
            phone: "",
            email: "",
            photo: "",
            jobTypes: [],
          });
          setOpenCategories({}); // Close all category dropdowns
        } else {
          // Consider parsing error message from backend if available
          res.json().then(errData => {
            alert(`Failed to register contractor: ${errData.message || 'Server error'}`);
          }).catch(() => {
            alert("Failed to register contractor and parse error response.");
          });
        }
      })
      .catch((err) => {
        console.error("Error submitting form:", err)
        alert("Error submitting form. Check console for details.");
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-blue-600 text-center">
        Register as a Contractor
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            name="organizationName"
            placeholder="Organization Name (Optional)"
            value={formData.organizationName}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            name="photo"
            placeholder="Photo URL (Optional)"
            value={formData.photo}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-3 text-gray-800">
            Select Your Job Types:
          </label>
          {loading ? (
            <p className="text-gray-500">Loading job types...</p>
          ) : error ? (
            <p className="text-red-600">Error loading job types: {error}</p>
          ) : Object.keys(jobCategoriesData).length === 0 ? (
            <p className="text-gray-500">No job types available at the moment.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(jobCategoriesData).map(([category, jobsInCategory]) => (
                jobsInCategory.length > 0 && ( // Only render category if it has jobs
                  <div key={category} className="p-3 border border-gray-200 rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleCategoryOpen(category)}
                      className="w-full text-left font-semibold text-gray-700 hover:text-blue-600 p-2 rounded-md bg-gray-50 flex justify-between items-center transition"
                    >
                      <span>{category}</span>
                      <span className={`transform transition-transform duration-200 ${openCategories[category] ? 'rotate-180' : 'rotate-0'}`}>
                        ▼
                      </span>
                    </button>
                    {openCategories[category] && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {jobsInCategory.map((job) => {
                          const isSelected = formData.jobTypes.includes(job._id);
                          return (
                            <div
                              key={job._id}
                              onClick={() => toggleJobSelection(job)}
                              className={`cursor-pointer p-3 rounded-md border text-sm transition-all duration-150 ${
                                isSelected
                                  ? "bg-blue-500 border-blue-600 text-white font-semibold shadow-md"
                                  : "bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                              }`}
                            >
                              {job.jobName}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition text-lg font-medium shadow-md hover:shadow-lg"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterContractor;