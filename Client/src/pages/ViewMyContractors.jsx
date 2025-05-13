import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import EditContractorForm from "../components/EditContractorForm";

const ViewMyContractors = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Define fetchContractors using useCallback to stabilize its identity
  const fetchContractors = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous error
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("You must be logged in to view your contractors.");
      setLoading(false);
      // Consider redirecting to login or showing a more prominent message
      return;
    }

    try {
      const res = await fetch(`http://localhost:5050/contractors/by-user/${userId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setContractors(data);
    } catch (err) {
      console.error("Failed to fetch contractors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]); // Call fetchContractors on mount and if it ever changes (it won't due to useCallback)

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contractor?")) return;
    try {
      const res = await fetch(`http://localhost:5050/contractors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Remove from local state, or refetch
        setContractors((prev) => prev.filter((c) => c._id !== id)); 
        // Or call fetchContractors(); for consistency, though local removal is faster UX
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || "Failed to delete contractor");
      }
    } catch (err) {
      console.error("Error deleting contractor:", err);
      alert("Error deleting contractor");
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (updatedContractor) => {
    // Update local state for immediate UI feedback
    setContractors((prev) =>
      prev.map((c) => (c._id === updatedContractor._id ? updatedContractor : c))
    );
    setEditingId(null);
    // Re-fetch from server to ensure data consistency
    // This will show the most up-to-date list including any server-side changes or calculations
    fetchContractors(); 
    alert("Contractor updated successfully!"); // Optional: success feedback
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (loading && contractors.length === 0) return <p className="text-center p-10">Loading your contractors...</p>;
  if (error) return <p className="text-red-500 text-center p-10">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-lg shadow-lg mt-8 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-blue-700 text-center">My Registered Contractors</h2>
      {contractors.length === 0 && !loading ? (
        <p className="text-center text-gray-600">No contractors registered yet. <a href="/register-contractor" className="text-blue-500 hover:underline">Register one now!</a></p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">First Name</th>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">Last Name</th>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">Organization</th>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">Phone</th>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">Job Types</th>
                <th className="px-4 py-3 border text-left text-sm font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contractors.map((contractor) => (
                <tr key={contractor._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border">{contractor.firstName}</td>
                  <td className="px-4 py-3 border">{contractor.lastName}</td>
                  <td className="px-4 py-3 border">{contractor.organizationName || "-"}</td>
                  <td className="px-4 py-3 border">{contractor.phone}</td>
                  <td className="px-4 py-3 border">{contractor.email}</td>
                  <td className="px-4 py-3 border text-xs">
                    {contractor.jobTypesDetails?.length > 0 ? (
                      contractor.jobTypesDetails.map((jt, index) => (
                        <span key={index} className="block py-0.5">
                          {jt.jobName}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(contractor._id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 transition mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contractor._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline edit form */}
      {editingId && (
        <div className="mt-8 p-6 border-t border-gray-200">
          <EditContractorForm
            contractor={contractors.find((c) => c._id === editingId)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
};

export default ViewMyContractors;