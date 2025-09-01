import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import NavBar from './components/NavBar'; // Ensure NavBar is imported
import VideoDetail from './components/VideoDetail'; // Import the VideoDetail component
import VideoAnalysis from './page/VideoAnalysis';

import Junction from './components/Junction';
import Map from './page/Map';
import Overview from './page/Overview';
import LengthVsSpeed from './subpage/LengthVsSpeed';
import Performance from './subpage/Performance';
import TrafficMetrics from './subpage/TrafficMetrics';
import TrafficVolume from './subpage/TrafficVolume';

import Contact from './subpage/Contact'; // Import Contact Page
import Settings from './subpage/Settings'; // Import Settings Page
import Support from './subpage/Support'; // Import Support Page
//import VideoAnalysis from './page/VideoAnalysis';
//import NotFound from './page/NotFound'; // Optional: A 404 page for unknown routes

const App = () => {
  return (
    <Router>
      <div>
        <NavBar /> {/* Ensure NavBar is displayed on all pages */}
        <Routes>
          
          <Route path="/" element={<Junction />} />
          <Route path="/DataTrends" element={<Navigate to="/Performance" />} />  {/* Redirects directly to Traffic Volume */}
          <Route path="/VideoAnalysis" element={<VideoAnalysis />} />
          <Route path="/Map" element={<Map />} />
          <Route path="/Overview" element={<Overview />} />
          <Route path="/TrafficVolume" element={<TrafficVolume />} />
          <Route path="/Performance" element={<Performance />} />
          <Route path="/TrafficMetrics" element={<TrafficMetrics />} />
          <Route path="/LengthVsSpeed" element={<LengthVsSpeed />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/Support" element={<Support />} />
          <Route path="/Contact" element={<Contact />} />

          <Route path="/video/:id" element={<VideoDetail />} /> {/* Video detail route */}
          
          {/* Optional: 404 page for unknown routes */}
          {/*<Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
