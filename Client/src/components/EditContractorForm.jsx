import React, { useEffect, useState } from "react";

const EditContractorForm = ({ contractor, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organizationName: "",
    phone: "",
    email: "",
    photo: "",
    jobTypes: [], // Will be initialized with string IDs
  });

  const [jobCategoriesData, setJobCategoriesData] = useState({});
  const [openCategories, setOpenCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Effect to fetch all available job types for selection
  useEffect(() => {
    const fetchJobTypes = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5050/job-types");
        if (!res.ok) throw new Error(`Failed to fetch job types - ${res.status}`);
        const groupedData = await res.json();

        const validData = {};
        for (const category in groupedData) {
          if (Object.prototype.hasOwnProperty.call(groupedData, category) && Array.isArray(groupedData[category])) {
            // Ensure each job has a string _id for consistency in selection logic
            validData[category] = groupedData[category].filter(job => job && job._id && job.jobName).map(job => ({
              ...job,
              _id: typeof job._id === 'object' && job._id.$oid ? job._id.$oid : String(job._id)
            }));
          }
        }
        setJobCategoriesData(validData);
      } catch (err) {
        console.error("Error fetching job types:", err);
        setError(err.message || "Failed to load job types.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobTypes();
  }, []);

  // Effect to initialize/update formData when the contractor prop changes
  useEffect(() => {
    let initialJobTypeIds = [];
    if (contractor && contractor.jobTypes && Array.isArray(contractor.jobTypes)) {
      initialJobTypeIds = contractor.jobTypes.map(jt => {
        if (typeof jt === 'string') {
          return jt; // Already an ID string
        }
        if (jt && typeof jt === 'object' && jt.$oid) {
          return jt.$oid; // It's a MongoDB ObjectId like { $oid: "..." }
        }
        // If contractor.jobTypes contains full job objects with an _id property
        if (jt && typeof jt === 'object' && jt._id) {
          if (typeof jt._id === 'object' && jt._id.$oid) {
            return jt._id.$oid; // _id is an ObjectId object
          }
          return String(jt._id); // _id is a string or can be converted
        }
        console.warn("Unknown jobType format in contractor data:", jt);
        return null; // Or handle unexpected format as needed
      }).filter(id => id !== null); // Filter out any nulls from unhandled formats
    }

    setFormData({
      firstName: contractor?.firstName || "",
      lastName: contractor?.lastName || "",
      organizationName: contractor?.organizationName || "",
      phone: contractor?.phone || "",
      email: contractor?.email || "",
      photo: contractor?.photo || "",
      jobTypes: initialJobTypeIds, // Use the extracted array of ID strings
    });
  }, [contractor]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleJobSelection = (job) => { // job object is passed, job._id is a string ID
    setFormData((prev) => {
      const currentJobTypes = [...prev.jobTypes]; // Array of selected string IDs
      const jobId = job._id; 
      const index = currentJobTypes.indexOf(jobId);

      if (index > -1) {
        currentJobTypes.splice(index, 1); // Remove ID
      } else {
        currentJobTypes.push(jobId); // Add ID
      }
      return { ...prev, jobTypes: currentJobTypes };
    });
  };

  const toggleCategoryOpen = (categoryName) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };


    try {
      const res = await fetch(`http://localhost:5050/contractors/${contractor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({message: `Failed to update contractor - Server responded with ${res.status}`}));
        throw new Error(errData.message);
      }
      const updatedContractor = await res.json();
      onSave(updatedContractor); // Notify parent with the updated contractor
    } catch (err) {
      console.error("Update error:", err);
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6 border rounded-lg bg-gray-50 shadow-md">
      <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">Edit Contractor Profile</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <input
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="Organization Name (Optional)"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <input
          name="photo"
          value={formData.photo}
          onChange={handleChange}
          placeholder="Photo URL (Optional)"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Job Types Selection */}
      <div>
        <label className="block text-lg font-medium mb-3 text-gray-800">
          Update Job Types:
        </label>
        {loading ? (
          <p className="text-gray-500">Loading job types...</p>
        ) : error ? (
          <p className="text-red-600 bg-red-50 p-3 rounded-md">Error: {error}</p>
        ) : Object.keys(jobCategoriesData).length === 0 ? (
            <p className="text-gray-500">No job types available to select.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(jobCategoriesData).map(([category, jobsInCategory]) => (
              jobsInCategory.length > 0 && (
                <div key={category} className="p-3 border border-gray-200 rounded-md shadow-sm bg-white">
                  <button
                    type="button"
                    onClick={() => toggleCategoryOpen(category)}
                    className="w-full text-left font-semibold text-gray-700 hover:text-blue-600 p-2 rounded-md bg-gray-100 hover:bg-gray-200 flex justify-between items-center transition"
                  >
                    <span>{category}</span>
                    <span className={`transform transition-transform duration-200 ${openCategories[category] ? 'rotate-180' : 'rotate-0'}`}>
                      ▼
                    </span>
                  </button>
                  {openCategories[category] && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {jobsInCategory.map((job) => {
                        // job._id here is now consistently a string ID
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

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition shadow-sm hover:shadow-md"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditContractorForm;