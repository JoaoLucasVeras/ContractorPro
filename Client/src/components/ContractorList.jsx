import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ContractorRow = ({ contractor, deleteContractor }) => (
  <tr className="border-b transition-colors hover:bg-muted/50">
    <td className="p-4">{contractor.firstName}</td>
    <td className="p-4">{contractor.lastName}</td>
    <td className="p-4">{contractor.organizationName}</td>
    <td className="p-4">{contractor.specialization}</td>
    <td className="p-4">{contractor.averageRating}</td>
    <td className="p-4">
      <div className="flex gap-2">
        <Link
          to={`/edit/${contractor._id}`}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Edit
        </Link>
        <button
          onClick={() => deleteContractor(contractor._id)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function ContractorList() {
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    async function getContractors() {
      try {
        const response = await fetch("http://localhost:5050/Contractor/");
        if (!response.ok) {
          console.error("Failed to fetch contractors");
          return;
        }
        const data = await response.json();
        setContractors(data);
      } catch (err) {
        console.error("Error fetching contractors:", err);
      }
    }
    getContractors();
  }, []);

  async function deleteContractor(id) {
    try {
      await fetch(`http://localhost:5050/Contractor/${id}`, {
        method: "DELETE",
      });
      setContractors(contractors.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting contractor:", err);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Contractors</h2>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4">First Name</th>
              <th className="p-4">Last Name</th>
              <th className="p-4">Organization</th>
              <th className="p-4">Specialization</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contractors.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No contractors found.
                </td>
              </tr>
            ) : (
              contractors.map((contractor) => (
                <ContractorRow
                  key={contractor._id}
                  contractor={contractor}
                  deleteContractor={deleteContractor}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
