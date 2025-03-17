#Y

import time
import json

def load_traffic_data(file_path="C:/Users/Admin/Desktop/Traffic Management System/traffic_timings_y.json"):
    """Load traffic signal data from a JSON file."""
    with open(file_path, 'r') as file:
        return json.load(file)

def traffic_signal(data):
    # Parse directions and their durations from the data
    directions = [
        {"name": direction["direction"], "green": direction["green_time"], "orange": direction["orange_time"]}
        for direction in data
    ]

    while True:
        for i, direction in enumerate(directions):
            # Handle green signal
            for t in range(int(direction["green"]), 0, -1):
                # Clear the console for dynamic updates (optional for better visualization)
                print("\033[H\033[J", end="")  # ANSI escape sequence to clear screen

                # Display the traffic signal status
                print("Traffic Signal Status:")
                for j, d in enumerate(directions):
                    if d["name"] == direction["name"]:
                        print(f"{d['name']}: GREEN ({t} seconds left)")
                    else:
                        # Calculate the waiting time based on the current position and the cycle
                        cycle_offset = (j - i - 1) % len(directions)
                        remaining_time = sum(
                            directions[(i + 1 + k) % len(directions)]["green"] + directions[(i + 1 + k) % len(directions)]["orange"]
                            for k in range(cycle_offset)
                        ) + direction["orange"]
                        print(f"{d['name']}: RED (Waiting: {remaining_time + t} seconds)")

                # Wait for 1 second
                time.sleep(1)

            # Handle orange signal
            for t in range(int(direction["orange"]), 0, -1):
                # Clear the console for dynamic updates (optional for better visualization)
                print("\033[H\033[J", end="")  # ANSI escape sequence to clear screen

                # Display the traffic signal status
                print("Traffic Signal Status:")
                for j, d in enumerate(directions):
                    if d["name"] == direction["name"]:
                        print(f"{d['name']}: ORANGE ({t} seconds left)")
                    else:
                        # Calculate the waiting time based on the current position and the cycle
                        cycle_offset = (j - i - 1) % len(directions)
                        remaining_time = sum(
                            directions[(i + 1 + k) % len(directions)]["green"] + directions[(i + 1 + k) % len(directions)]["orange"]
                            for k in range(cycle_offset)
                        ) + direction["orange"]
                        print(f"{d['name']}: RED (Waiting: {remaining_time + t - direction['orange']} seconds)")

                # Wait for 1 second
                time.sleep(1)

if __name__ == "__main__":
    try:
        # Load traffic data from the JSON file
        traffic_data = load_traffic_data("C:/Users/Admin/Desktop/Traffic Management System/traffic_timings_y.json")
        traffic_signal(traffic_data)
    except KeyboardInterrupt:
        print("\nTraffic signal simulation ended.")
    except FileNotFoundError:
        print("Error: traffic_data.json file not found.")
