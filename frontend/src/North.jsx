import { useEffect, useState } from "react";

function App() {
  const [northSignal, setNorthSignal] = useState("");  // Store only the North signal data

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/stream-signals");

    eventSource.onmessage = (event) => {
      setNorthSignal(event.data);  // Display the North signal data received from server
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
      <h1>Traffic Signal Status (North)</h1>
      <pre>{northSignal}</pre>
    </div>
  );
}

export default App;
