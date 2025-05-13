import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Components/authContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    logout();
    navigate("/");
  };

  const isLoggedIn = !!localStorage.getItem("authToken");

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to={isLoggedIn ? "/dashboard" : "/"}
          className="text-white text-xl font-semibold hover:underline"
        >
          Contractor Connect
        </Link>

        <ul className="flex space-x-4 items-center text-white relative">
          {!isLoggedIn ? (
            <>
              <li>
                <Link to="/login" className="hover:underline">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:underline">Register</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              </li>

              <li>
                <Link to="/profile" className="hover:underline">Profile</Link>
              </li>

              <li className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="hover:underline focus:outline-none"
                >
                  My Contractors ▾
                </button>
                {dropdownOpen && (
                  <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
                    <li>
                      <Link
                        to="/registerContractor"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Register Contractor
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/viewMyContractors"
                        className="block px-4 py-2 hover:bg-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        View My Contractors
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button onClick={handleLogout} className="hover:underline">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
