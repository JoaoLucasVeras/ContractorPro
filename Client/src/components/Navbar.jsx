import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Components/authContext"; 

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    if (typeof logout === 'function') {
        logout();
    }
    setDropdownOpen(false);
    navigate("/");
  };

  const authToken = localStorage.getItem("authToken");
  const { isLoggedIn: contextIsLoggedIn, user } = useContext(AuthContext); 
  const isLoggedIn = contextIsLoggedIn || !!authToken; 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const navItemClasses = "px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors duration-150";
  const activeNavItemClasses = "bg-gray-900 text-white"; 

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to={isLoggedIn ? "/dashboard" : "/"}
          className="text-2xl font-bold hover:opacity-80 transition-opacity"
        >
          <span className="text-white">Contractor</span><span className="text-orange-400">Pro</span>
        </Link>

        <ul className="flex space-x-2 sm:space-x-4 items-center text-gray-300 relative"> 
          {!isLoggedIn ? (
            <>
              <li>
                <Link to="/login" className={`${navItemClasses} hover:text-white`}>Login</Link>
              </li>
              <li>
                <Link to="/register" className={`${navItemClasses} hover:text-white`}>Register</Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" className={`${navItemClasses} hover:text-white`}>Dashboard</Link>
              </li>

              <li>
                <Link to="/profile" className={`${navItemClasses} hover:text-white`}>Profile</Link>
              </li>

              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`${navItemClasses} hover:text-white flex items-center`} 
                >
                  My Contractors
                  <svg
                    className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {dropdownOpen && (
                  <ul className="absolute right-0 mt-2 w-56 bg-white text-gray-700 rounded-md shadow-xl z-50 py-1 origin-top-right">
                    <li>
                      <Link
                        to="/registerContractor"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-blue-600 w-full text-left"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Register New Contractor
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/viewMyContractors"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-blue-600 w-full text-left"
                        onClick={() => setDropdownOpen(false)}
                      >
                        View My Contractors
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button onClick={handleLogout} className={`${navItemClasses} hover:text-white`}>
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