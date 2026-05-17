import {createContext, useContext, useEffect, useState} from "react";
import {getCurrentUser} from "@/db/auth";
import useFetch from "@/hooks/use-fetch";
import  supabase  from "@/db/supabase";

const AuthContext = createContext(null);

const AuthProvider = ({children}) => {
  

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

                                                   
   useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])
  
   return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
};

export const AuthState = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("AuthState must be used within a AuthProvider");
  }
   
  return ctx;
};


export default AuthProvider;