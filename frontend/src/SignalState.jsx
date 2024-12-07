import { useEffect, useState } from "react";

function TrafficSignals() {
  const [signals, setSignals] = useState({
    North: "Unknown",
    South: "Unknown",
    East: "Unknown",
    West: "Unknown",
  });

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/current-signals");

    eventSource.onmessage = (event) => {
      const updatedSignals = JSON.parse(event.data);
      setSignals(updatedSignals);
    };

    eventSource.onerror = (error) => {
      console.error("Error with EventSource:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Traffic Signal Status</h1>
      <div>
        <h2>North: {signals.North}</h2>
        <h2>South: {signals.South}</h2>
        <h2>East: {signals.East}</h2>
        <h2>West: {signals.West}</h2>
      </div>
    </div>
  );
}

export default TrafficSignals;
