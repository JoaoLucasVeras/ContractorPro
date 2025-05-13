import { Outlet } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { AuthProvider } from "./Components/authContext";
const App = () => {
  return (
    <AuthProvider> {/* Wrap your app with AuthProvider */}
      <div className="w-full p-6">
        <Navbar /> {/* Navigation bar */}
        <Outlet /> {/* This renders the nested components based on the route */}
      </div>
    </AuthProvider>
  );
};

export default App;
