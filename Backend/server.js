const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { exec, spawn } = require("child_process");
const Signal = require("./models/Signal");
const cors = require("cors");
const path = require("path");
const csv = require("csv-parser");
const csvParser = require("csv-parser");
const http = require('http');
// const io = socketIo(server, {
  
//   cors: {
//       origin: "http://localhost:5000", // Allow frontend origin
//       methods: ["GET", "POST"],
//   },
// });

const app = express();
app.use(cors());

// MongoDB connection
mongoose.connect(
  "mongodb+srv://sricharankolachalama:Charan05@cluster0.wfgb0zu.mongodb.net/traffic_management?retryWrites=true&w=majority",
  {}
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.on("disconnected", () => {
  console.error("MongoDB disconnected. Attempting to reconnect...");
  mongoose.connect(
    "mongodb+srv://sricharankolachalama:Charan05@cluster0.wfgb0zu.mongodb.net/traffic_management?retryWrites=true&w=majority",
    {}
  );
});

// Function to run pso_final
const runPSOFinal = () => {
  return new Promise((resolve, reject) => {
    console.log("Executing PSO Final Script...");
    exec("python pso_final.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing pso_final.py: ${stderr}`);
        return reject(error);
      }
      console.log("PSO Final executed successfully.");
      resolve(stdout);
    });
  });
};

// Save traffic data to MongoDB
const saveDataToMongoDB = async () => {
  try {
    const rawData = fs.readFileSync("C:/Users/Admin/Desktop/Traffic Management System/Backend/traffic_data.json");
    const trafficData = JSON.parse(rawData);

    await Signal.deleteMany({});
    console.log("Existing data cleared.");

    const savePromises = Object.keys(trafficData).map((direction) => {
      const { Green, Red, Orange } = trafficData[direction];
      return Signal.create({
        direction,
        green: Green,
        red: Red,
        orange: Orange,
      });
    });

    await Promise.all(savePromises);
    console.log("Traffic data saved to MongoDB.");
  } catch (err) {
    console.error("Error saving traffic data to MongoDB:", err);
  }
};

db.once("open", async () => {
  console.log("Connected to MongoDB.");
  try {
    await runPSOFinal();
    await saveDataToMongoDB();
  } catch (err) {
    console.error("Error in the data processing pipeline:", err);
  }
});

// Stream signals
app.get("/stream-signals", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const pythonProcess = spawn("python", ["-u", path.join(__dirname, "signal_working_final.py")]);
  console.log("Running script at:", path.join(__dirname, "signal_working_final.py"));


  pythonProcess.stdout.on("data", (data) => {
    // Clean the data by removing unwanted control characters and extra lines
    const output = data.toString().replace(/[\[\]HJK]/g, "").trim();  // Remove control chars

    // Extract only the North direction line
    const northSignal = output.split("\n").find(line => line.includes("North"));
    const southSignal = output.split("\n").find(line => line.includes("South"));
    const eastSignal = output.split("\n").find(line => line.includes("East"));
    const westSignal = output.split("\n").find(line => line.includes("West"));

    if (northSignal) {
      console.log("Received North signal data:", northSignal);
      res.write(`data: ${northSignal}\n\n`);  // Send only the North direction data
    }
    if (southSignal) {
      console.log("Received South signal data:", southSignal);
      res.write(`data: ${southSignal}\n\n`);  // Send only the South direction data
    }
    if (eastSignal) {
      console.log("Received East signal data:", eastSignal);
      res.write(`data: ${eastSignal}\n\n`);  // Send East direction data
    }

    if (westSignal) {
      console.log("Received West signal data:", westSignal);
      res.write(`data: ${westSignal}\n\n`);  // Send West direction data
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    res.end();
  });

  req.on("close", () => {
    console.log("Client disconnected, killing Python process.");
    pythonProcess.kill();
  });
});

// Path to the CSV file
const csvFilePath = path.join(__dirname, "../ml model/outputs/combined_traffic_data.csv");

// Helper function to read CSV and filter data by direction
const getDirectionData = (direction) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.Direction && data.Direction.trim().toLowerCase() === direction.toLowerCase()) {
          results.push(data);
        }
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// Endpoint for North
app.get("/north", async (req, res) => {
  try {
    const northData = await getDirectionData("North");
    res.json(northData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data for North direction." });
  }
});

// Endpoint for South
app.get("/south", async (req, res) => {
  try {
    const southData = await getDirectionData("South");
    res.json(southData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data for South direction." });
  }
});

// Endpoint for East
app.get("/east", async (req, res) => {
  try {
    const eastData = await getDirectionData("East");
    res.json(eastData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data for East direction." });
  }
});

// Endpoint for West
app.get("/west", async (req, res) => {
  try {
    const westData = await getDirectionData("West");
    res.json(westData);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data for West direction." });
  }
});


// Function to handle the signal countdown for a specific direction
const getSignalCountdown = (direction, req, res) => {
  const pythonProcess = spawn("python", ["-u", "signal_working_final.py"]);

  // Stream Python output in real-time
  pythonProcess.stdout.on("data", (data) => {
    // Clean the data by removing control characters like [H] [J] etc.
    const output = data.toString().replace(/[\[\]HJK]/g, "").trim();

    // Extract the relevant signal line based on direction
    const signalLine = output.split("\n").find((line) => line.includes(direction));

    if (signalLine) {
      console.log(`Sending ${direction} Signal:`, signalLine);
      res.write(`data: ${signalLine}\n\n`); // Send data to the client
    }
  });

  // Handle Python script errors
  pythonProcess.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
  });

  // Handle Python script exit
  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    res.end(); // Close the SSE connection
  });

  // Handle client disconnection
  req.on("close", () => {
    console.log("Client disconnected, killing Python process.");
    if (!pythonProcess.killed) {
      pythonProcess.kill("SIGTERM"); // Gracefully terminate the Python process
    }
  });
};

// Endpoint for real-time North Signal Countdown
app.get("/north-countdown", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  getSignalCountdown("North", req, res); // Pass req and res to the function
});

// Endpoint for real-time South Signal Countdown
app.get("/south-countdown", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  getSignalCountdown("South", req, res); // Pass req and res to the function
});

// Endpoint for real-time East Signal Countdown
app.get("/east-countdown", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  getSignalCountdown("East", req, res); // Pass req and res to the function
});

// Endpoint for real-time West Signal Countdown
app.get("/west-countdown", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  getSignalCountdown("West", req, res); // Pass req and res to the function
});

// Endpoint for North Metrics
app.get("/north-metrics", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const csvFilePath = path.join(__dirname, "../ml model/outputs/frames_video1_metrics.csv"); // Replace with actual path for North

  const rows = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", () => {
      let currentIndex = 0;

      const sendNextMetric = () => {
        const row = rows[currentIndex];
        const data = `Frame: ${row.Frame}, Vehicle Count: ${row.Vehicle_Count}, Average Speed (km/h): ${row.Average_Speed_kmph}, Queue Length (m): ${row.Queue_Length_meters}, Congestion Level: ${row.Congestion_Level}, Traffic Density: ${row.Traffic_Density_vehicles_per_meter}`;
        res.write(`data: ${data}\n\n`);

        currentIndex = (currentIndex + 1) % rows.length;
        setTimeout(sendNextMetric, 1000);
      };

      sendNextMetric();
    });

  req.on("close", () => {
    console.log("Client disconnected, ending stream.");
    res.end();
  });
});

// Endpoint for South Metrics
app.get("/south-metrics", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const csvFilePath = path.join(__dirname, "../ml model/outputs/frames_video2_metrics.csv");// Replace with actual path for South

  const rows = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", () => {
      let currentIndex = 0;

      const sendNextMetric = () => {
        const row = rows[currentIndex];
        const data = `Frame: ${row.Frame}, Vehicle Count: ${row.Vehicle_Count}, Average Speed (km/h): ${row.Average_Speed_kmph}, Queue Length (m): ${row.Queue_Length_meters}, Congestion Level: ${row.Congestion_Level}, Traffic Density: ${row.Traffic_Density_vehicles_per_meter}`;
        res.write(`data: ${data}\n\n`);

        currentIndex = (currentIndex + 1) % rows.length;
        setTimeout(sendNextMetric, 1000);
      };

      sendNextMetric();
    });

  req.on("close", () => {
    console.log("Client disconnected, ending stream.");
    res.end();
  });
});

// Endpoint for East Metrics
app.get("/east-metrics", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const csvFilePath = path.join(__dirname, "../ml model/outputs/frames_video3_metrics.csv"); // Replace with actual path for East

  const rows = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", () => {
      let currentIndex = 0;

      const sendNextMetric = () => {
        const row = rows[currentIndex];
        const data = `Frame: ${row.Frame}, Vehicle Count: ${row.Vehicle_Count}, Average Speed (km/h): ${row.Average_Speed_kmph}, Queue Length (m): ${row.Queue_Length_meters}, Congestion Level: ${row.Congestion_Level}, Traffic Density: ${row.Traffic_Density_vehicles_per_meter}`;
        res.write(`data: ${data}\n\n`);

        currentIndex = (currentIndex + 1) % rows.length;
        setTimeout(sendNextMetric, 1000);
      };

      sendNextMetric();
    });

  req.on("close", () => {
    console.log("Client disconnected, ending stream.");
    res.end();
  });
});

// Endpoint for West Metrics
app.get("/west-metrics", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const csvFilePath = path.join(__dirname, "../ml model/outputs/frames_video4_metrics.csv");// Replace with actual path for West

  const rows = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", () => {
      let currentIndex = 0;

      const sendNextMetric = () => {
        const row = rows[currentIndex];
        const data = `Frame: ${row.Frame}, Vehicle Count: ${row.Vehicle_Count}, Average Speed (km/h): ${row.Average_Speed_kmph}, Queue Length (m): ${row.Queue_Length_meters}, Congestion Level: ${row.Congestion_Level}, Traffic Density: ${row.Traffic_Density_vehicles_per_meter}`;
        res.write(`data: ${data}\n\n`);

        currentIndex = (currentIndex + 1) % rows.length;
        setTimeout(sendNextMetric, 1000);
      };

      sendNextMetric();
    });

  req.on("close", () => {
    console.log("Client disconnected, ending stream.");
    res.end();
  });
});


app.post('/run-notebooks', (req, res) => {
  const notebookFolder = path.join(__dirname, '../ML/notebooks');

  // List of notebook filenames (update if necessary)
  const notebooks = [
      //'data_preprocessing.ipynb',
      'pso_implementation.ipynb',
      //'visualization.ipynb'
  ];

  // Function to execute notebooks sequentially
  const runNotebook = (index) => {
      if (index >= notebooks.length) {
          return res.json({ message: 'All notebooks executed successfully and outputs saved.' });
      }

      const notebookPath = path.join(notebookFolder, notebooks[index]);
      const command = `papermill "${notebookPath}" "${notebookPath}"`;

      exec(command, (error, stdout, stderr) => {
          if (error) {
              console.error(`Error running ${notebooks[index]}:`, stderr);
              return res.status(500).json({
                  error: `Failed to execute ${notebooks[index]}`,
                  details: stderr,
              });
          }
          
          // Log the notebook output to the VS Code terminal
          console.log(`Executed ${notebooks[index]} successfully.`);
          console.log(stdout);  // Display notebook output in VS Code terminal

          runNotebook(index + 1); // Run the next notebook
      });
  };

  // Start executing notebooks from the first one
  runNotebook(0);
});

// Paths
const videoDirectory = path.join(__dirname, '../ML/data/videos');
const emergencyFilePath = path.join(__dirname, '../ML/outputs/results/emergency.json');

// Endpoint to list videos
app.get('/videos', (req, res) => {
    fs.readdir(videoDirectory, (err, files) => {
        if (err) {
            console.error('Error reading video directory:', err);
            return res.status(500).json({ error: 'Failed to load videos' });
        }

        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        res.json(videoFiles);
    });
});

// Endpoint to stream a specific video
app.get('/video/:filename', (req, res) => {
    const videoPath = path.join(videoDirectory, req.params.filename);

    fs.stat(videoPath, (err, stats) => {
        if (err) {
            console.error('Error accessing video file:', err);
            return res.status(404).send('Video not found');
        }

        const range = req.headers.range;
        if (!range) {
            return res.status(416).send('Range header required');
        }

        const videoSize = stats.size;
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
    });
});

// Endpoint to fetch emergency data
app.get('/emergency-data', (req, res) => {
    res.sendFile(emergencyFilePath, (err) => {
        if (err) {
            console.error('Error sending emergency.json:', err);
            res.status(500).json({ error: 'Failed to fetch emergency data' });
        }
    });
});


// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
