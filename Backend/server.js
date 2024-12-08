const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const { exec, spawn } = require("child_process");
const Signal = require("./models/Signal");
const cors = require("cors");
const path = require("path");

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

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
