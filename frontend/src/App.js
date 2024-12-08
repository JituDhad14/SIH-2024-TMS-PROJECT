import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TrafficSignalStatus from "./TrafficSignalStatus";
import MetricsDisplay from './MetricsDisplay';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrafficSignalStatus />} />
        <Route path="/metrics" element={<MetricsDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
