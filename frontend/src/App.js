import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TrafficSignalStatus from "./TrafficSignalStatus";
import SignalState from "./SignalState";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrafficSignalStatus />} />
        <Route path="/signals" element={<SignalState />} />
      </Routes>
    </Router>
  );
}

export default App;
