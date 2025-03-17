import numpy as np
import pandas as pd
import json

# Example traffic data for Y-junction
data_y = pd.DataFrame({
    'Direction': ['North', 'South', 'East'],
    'Traffic_Volume': [18.36, 24.6, 26.16],
    'Average_Speed_kmph': [43.18, 42.98, 21.33],
    'Queue_Length_meters': [21.29, 16.79, 14.05],
    'Traffic_Density_vehicles_per_meter': [0.79, 1.47, 1.86]
})

# Example traffic data for U-turn
data_u = pd.DataFrame({
    'Direction': ['North', 'South', 'East', 'West', 'U-Turn'],
    'Traffic_Volume': [18.36, 24.6, 26.16, 25.04, 10.5],
    'Average_Speed_kmph': [43.18, 42.98, 21.33, 32.51, 15.0],
    'Queue_Length_meters': [21.29, 16.79, 14.05, 14.39, 10.0],
    'Traffic_Density_vehicles_per_meter': [0.79, 1.47, 1.86, 1.77, 0.5]
})

# PSO Function (same logic as before)
def pso_traffic_signal_optimization(data, total_cycle_time=120):
    num_particles = 40
    num_iterations = 150
    orange_time = 3
    particles = np.random.rand(num_particles, len(data) * 2)

    congestion_factors = (data['Traffic_Density_vehicles_per_meter'] * 0.5 +
                          data['Queue_Length_meters'] * 0.3 +
                          data['Traffic_Volume'] * 0.2)
    congestion_factors = congestion_factors / congestion_factors.sum()

    for i in range(num_particles):
        particles[i][:len(data)] = congestion_factors * (total_cycle_time - orange_time * len(data))
        particles[i][len(data):] = total_cycle_time - (particles[i][:len(data)] + orange_time)

    best_solution = particles[0]
    best_fitness = float('inf')

    for iteration in range(num_iterations):
        for i in range(num_particles):
            fitness = np.sum(np.abs(particles[i][:len(data)] - congestion_factors * particles[i][:len(data)].sum()))
            if fitness < best_fitness:
                best_solution = particles[i]
                best_fitness = fitness

    return [
        {
            'direction': data['Direction'][i],
            'green_time': round(best_solution[i], 2),
            'red_time': round(best_solution[len(data) + i], 2),
            'orange_time': orange_time
        }
        for i in range(len(data))
    ]

# Generate JSON for Y-junction and U-turn
results_y = pso_traffic_signal_optimization(data_y)
results_u = pso_traffic_signal_optimization(data_u)

# Save JSON files
with open('traffic_timings_y.json', 'w') as f:
    json.dump(results_y, f, indent=4)

with open('traffic_timings_u.json', 'w') as f:
    json.dump(results_u, f, indent=4)
