

import AppLayout from './components/layout/AppLayout.jsx';
import ResetPassword from "@/pages/reset-password";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LandingPage from './pages/LandingPage.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuthProvider from './context/authcontext.jsx';
import Pricing from './pages/Pricing.jsx';
import RequireAuth from './components/RequireAuth.jsx';


import ScrollToTop from '@/components/ScrollToTop.jsx';
import PitchDashboard from '@/pages/PitchDashboard.jsx';
import PitchHistory from './pages/PitchHistory.jsx';
import PitchResult from './pages/PitchResult.jsx';
import FounderAnalytics from './pages/FounderAnalytics.jsx';
import IdeaBank from './pages/IdeaBank.jsx';



const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: (<LandingPage />),
      },
      {
        path: "/auth",
        element: (<Auth />),
      },
      {
        path: "/dashboard",
        element:( <RequireAuth>
            <Dashboard />
            </RequireAuth>
          ),
      },
       {
        path: "/reset-password",
        element:( 
            <ResetPassword />
          ),
      },
       {
        path: "/pricing",
        element:( 
            <Pricing />
          ),
      },
       {
        path: "/pitch",
        element:( 
          <RequireAuth>
            <PitchDashboard />
           </RequireAuth>
          ),
      },
       {
        path: "/history",
        element:( 
          <RequireAuth>
            <PitchHistory />
           </RequireAuth>
          ),
      },
       {
        path: "/pitch-result/:id",
        element:( 
          <RequireAuth>
            <PitchResult />
           </RequireAuth>
          ),
      },
      {
        path: "/analytics",
        element:(
          <RequireAuth>
            <FounderAnalytics />
           </RequireAuth>
          ),
      },
      {
        path: "/ideas",
        element:(
          <RequireAuth>
            <IdeaBank />
          </RequireAuth>
        ),
      },
    ],
  },
]);

const App = () => {
  
  return (
     <AuthProvider>
      <RouterProvider router={router} />
      </AuthProvider>
      
  )
}

export default App