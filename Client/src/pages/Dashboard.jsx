import JobSearch from "../components/JobSearch";
import RatingForm from "../components/RatingForm"; // Assume you have this or want to create it

const Dashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Search */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Contractors</h2>
          <JobSearch />
        </div>

        {/* Rating Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Rate a Contractor</h2>
          <RatingForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
