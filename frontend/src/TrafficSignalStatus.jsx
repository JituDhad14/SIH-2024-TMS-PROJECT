import { useEffect, useState } from "react";

function App() {
  const [signals, setSignals] = useState({
    North: "",
    South: "",
    East: "",
    West: "",
  });

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/stream-signals");

    eventSource.onmessage = (event) => {
      console.log("Event data received:", event.data); // Log incoming data
      const data = event.data.trim();
  
      if (data.startsWith("North")) {
          setSignals((prevSignals) => ({
              ...prevSignals,
              North: data,
          }));
      } else if (data.startsWith("South")) {
          setSignals((prevSignals) => ({
              ...prevSignals,
              South: data,
          }));
      } else if (data.startsWith("East")) {
          setSignals((prevSignals) => ({
              ...prevSignals,
              East: data,
          }));
      } else if (data.startsWith("West")) {
          setSignals((prevSignals) => ({
              ...prevSignals,
              West: data,
          }));
      }
  };
  
  eventSource.onerror = (error) => {
      console.error("Error with EventSource:", error);
      console.log("EventSource readyState:", eventSource.readyState); // Log connection state
  };
  
  eventSource.onopen = () => {
    console.log("EventSource connection established.");
};


    return () => {
      eventSource.close();
    };
  }, []);

  const getSignalColor = (signal) => {
    const match = signal.match(/GREEN|RED|ORANGE/i);
    return match ? match[0] : "Unknown";
  };

  return (
    <div>
      <h1>Traffic Signal Status</h1>
      <div style={{ marginTop: "20px" }}>
        <h2>Current Signals</h2>
        <ul>
          <li><strong>North:</strong> {signals.North || "Waiting for update..."}</li>
          <li><strong>South:</strong> {signals.South || "Waiting for update..."}</li>
          <li><strong>East:</strong> {signals.East || "Waiting for update..."}</li>
          <li><strong>West:</strong> {signals.West || "Waiting for update..."}</li>
        </ul>
      </div>

      {/* Display direction and color at the bottom */}
      <div style={{ marginTop: "40px", fontSize: "18px", textAlign: "center" }}>
        <h2>Current Signal Colors</h2>
        <p><strong>North:</strong> {getSignalColor(signals.North)}</p>
        <p><strong>South:</strong> {getSignalColor(signals.South)}</p>
        <p><strong>East:</strong> {getSignalColor(signals.East)}</p>
        <p><strong>West:</strong> {getSignalColor(signals.West)}</p>
      </div>
    </div>
  );
}

export default App;
