import React from "react";
import Junction from "../components/Junction"

function SimulationContainer() {
  return (
    <div className="simulation-container">
      <div className="simulation">
        <h3>STANDARD SIGNAL (Fixed 60s)</h3>
        <Junction csvFile="./simulation2.csv" mode="fixed" />
      </div>
      <div className="simulation">
        <h3>PSO SIGNAL (Adaptive Mode)</h3>
        <Junction csvFile="./simulation2.csv" mode="adaptive" />
      </div>
    </div>
  );
}

export default SimulationContainer;