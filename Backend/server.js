// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const Signal = require('./models/Signal'); // Import the schema
const cors = require('cors');

const app = express();
app.use(cors());
// Connect to MongoDB
mongoose.connect('mongodb+srv://sricharankolachalama:Charan05@cluster0.wfgb0zu.mongodb.net/traffic_management?retryWrites=true&w=majority&appName=Cluster0', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Function to run pso_final
const runPSOFinal = () => {
    return new Promise((resolve, reject) => {
        console.log('Executing PSO Final Script...');
        exec('python pso_final.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing pso_final.py: ${stderr}`);
                return reject(error);
            }
            console.log('PSO Final executed successfully.');
            resolve(stdout);
        });
    });
};

// Function to load JSON and save to MongoDB
const saveDataToMongoDB = async () => {
    try {
        const rawData = fs.readFileSync('traffic_data.json');
        const trafficData = JSON.parse(rawData);

        // Clear existing data
        await Signal.deleteMany({});
        console.log('Existing data cleared.');

        // Save new data
        const savePromises = Object.keys(trafficData).map(direction => {
            const { Green, Red, Orange } = trafficData[direction];
            return Signal.create({
                direction,
                green: Green,
                red: Red,
                orange: Orange,
            });
        });

        await Promise.all(savePromises);
        console.log('Traffic data saved to MongoDB.');
    } catch (err) {
        console.error('Error saving traffic data to MongoDB:', err);
    }
};

// Execute PSO Final and Save to MongoDB
db.once('open', async () => {
    console.log('Connected to MongoDB.');

    try {
        // Step 1: Run the PSO Final script
        await runPSOFinal();

        // Step 2: Save the output from JSON to MongoDB
        await saveDataToMongoDB();
    } catch (err) {
        console.error('Error in the data processing pipeline:', err);
    }
});

//signal streaming
app.get("/stream-signals", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
  
    const pythonProcess = spawn("python", ["-u", "C:/Users/Admin/Desktop/Traffic Management System/Backend/singal_working_final.py"]);
  
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
  
// Endpoint for current signal states
app.get("/current-signals", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const pythonProcess = spawn("python", ["-u", "C:/Users/Admin/Desktop/Traffic Management System/Backend/singal_working_final.py"]);

  pythonProcess.stdout.on("data", (data) => {
    // Clean the data
    const output = data.toString().replace(/[\[\]HJK]/g, "").trim();

    // Extract direction states
    const north = output.split("\n").find(line => line.includes("North"));
    const south = output.split("\n").find(line => line.includes("South"));
    const east = output.split("\n").find(line => line.includes("East"));
    const west = output.split("\n").find(line => line.includes("West"));

    // Format as a single JSON object
    const currentSignals = {
      North: north ? north.match(/GREEN|RED|ORANGE/)[0] : "Unknown",
      South: south ? south.match(/GREEN|RED|ORANGE/)[0] : "Unknown",
      East: east ? east.match(/GREEN|RED|ORANGE/)[0] : "Unknown",
      West: west ? west.match(/GREEN|RED|ORANGE/)[0] : "Unknown",
    };

    res.write(`data: ${JSON.stringify(currentSignals)}\n\n`);
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


// Start the server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
