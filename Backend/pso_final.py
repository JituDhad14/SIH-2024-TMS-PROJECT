import json
import numpy as np
import pandas as pd

data = pd.read_csv('C:/Users/Admin/Desktop/Traffic Management System/ML Model/outputs/combined_traffic_data.csv')

# PSO parameters
num_particles = 40
num_iterations = 150
c1 = 2.5  # cognitive coefficient
c2 = 2.5  # social coefficient
w = 0.5  # inertia weight

def fitness_function(signal_timings, data, total_cycle_time=120):
    green_times = signal_timings[:4]
    orange_time = 3

    # Enforce total-cycle constraints
    if np.sum(green_times) + orange_time * len(green_times) > total_cycle_time:
        return float('inf')  # Invalid configuration

    red_times = calculate_red_times(green_times, total_cycle_time, orange_time)

    # Compute congestion factors with adjusted weights
    congestion_factors = (data['Traffic_Density_vehicles_per_meter'] * 0.4 +
                          data['Queue_Length_meters'] * 0.3 +
                          data['Traffic_Volume'] * 0.3)
    congestion_factors = congestion_factors / congestion_factors.sum()

    # Penalize deviations from congestion-proportional green times
    proportional_green_times = congestion_factors * green_times.sum()
    penalty = np.sum(np.abs(green_times - proportional_green_times))

    # Calculate waiting time based on congestion factors
    total_waiting_time = 0
    for i, direction in enumerate(data['Direction']):
        waiting_time = ((red_times[i] + orange_time) / (green_times[i] + orange_time)) * congestion_factors[i]
        total_waiting_time += waiting_time

    return total_waiting_time + penalty

def normalize_green_times(green_times, data, total_cycle_time=120, orange_time=3):
    congestion_factors = (data['Traffic_Density_vehicles_per_meter'] * 0.4 +
                          data['Queue_Length_meters'] * 0.3 +
                          data['Traffic_Volume'] * 0.3)
    congestion_factors = congestion_factors / congestion_factors.sum()

    available_time = total_cycle_time - orange_time * len(data)
    green_times = congestion_factors * available_time

    return green_times

def calculate_red_times(green_times, total_cycle_time=120, orange_time=3):
    red_times = total_cycle_time - (green_times + orange_time)
    return red_times

def pso_traffic_signal_optimization_refined():
    congestion_factors = (data['Traffic_Density_vehicles_per_meter'] * 0.5 +
                          data['Queue_Length_meters'] * 0.3 +
                          data['Traffic_Volume'] * 0.2)
    congestion_factors = congestion_factors / congestion_factors.sum()

    particles = np.random.rand(num_particles, 8)
    for i in range(num_particles):
        particles[i][:4] = congestion_factors * (120 - 3 * len(data))
        particles[i][4:] = calculate_red_times(particles[i][:4])

    for i in range(num_particles):
        if np.any(particles[i][4:] < 0):
            raise ValueError(f"Negative red time detected for particle {i}: {particles[i]}")

    pbest_positions = particles.copy()
    pbest_fitness = np.array([fitness_function(p, data) for p in particles])

    gbest_position = pbest_positions[np.argmin(pbest_fitness)]
    gbest_fitness = np.min(pbest_fitness)

    for iteration in range(num_iterations):
        for i in range(num_particles):
            particles[i][:4] = normalize_green_times(particles[i][:4], data)
            particles[i][4:] = calculate_red_times(particles[i][:4])

            if np.any(particles[i][4:] < 0):
                raise ValueError(f"Negative red time detected for particle {i}: {particles[i]}")

            fitness = fitness_function(particles[i], data)

            if fitness < pbest_fitness[i]:
                pbest_fitness[i] = fitness
                pbest_positions[i] = particles[i]

        gbest_position = pbest_positions[np.argmin(pbest_fitness)]
        gbest_fitness = np.min(pbest_fitness)

        print(f"Iteration {iteration + 1}, Best Fitness: {gbest_fitness}")
        print(f"Current Best Timings: {gbest_position[:4]}")

    return gbest_position

optimized_signal_timings = pso_traffic_signal_optimization_refined()

print("\nOptimized Green and Red Signal Timings:")
for i, direction in enumerate(data['Direction']):
    green_time = round(optimized_signal_timings[i])
    red_time = round(optimized_signal_timings[i + 4])
    print(f"{direction}: Green = {green_time:.2f} sec, Red = {red_time:.2f} sec, Orange = 3 sec")

traffic_data = {}
for i, direction in enumerate(data['Direction']):
    green_time = round(optimized_signal_timings[i])
    red_time = round(optimized_signal_timings[i + 4])
    traffic_data[direction] = {
        "Green": green_time,
        "Red": red_time,
        "Orange": 3
    }

# Saving to traffic_data.json
with open('./traffic_data.json', 'w') as json_file:
    json.dump(traffic_data, json_file, indent=4)

print("\nTraffic data saved to traffic_data.json")