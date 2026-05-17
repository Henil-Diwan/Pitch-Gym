import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {AuthState} from "@/context/authcontext.jsx";
// import {BarLoader} from "react-spinners";

function RequireAuth({children}) {
  
  const navigate = useNavigate();
  const { loading, isAuthenticated } = AuthState();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return <div>Loading...</div>; // spinner / skeleton
  }

  if (!isAuthenticated) {
    return null; 
  }

  return children;
}   

export default RequireAuth;
