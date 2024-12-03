from stable_baselines3 import SAC
import gymnasium as gym
import pandas as pd
import numpy as np
from gymnasium.spaces import Box

# Example traffic data DataFrame
data = pd.DataFrame({
    'Direction': ['North', 'South', 'East', 'West'],
    'Traffic_Volume': [18.36, 24.6, 26.16, 25.04],
    'Average_Speed_kmph': [43.18, 42.98, 21.33, 32.51],
    'Queue_Length_meters': [21.29, 16.79, 14.05, 14.39],
    'Traffic_Density_vehicles_per_meter': [0.79, 1.47, 1.86, 1.77]
})

# Define the Traffic Environment class
class TrafficEnv(gym.Env):
    def __init__(self, data):
        super(TrafficEnv, self).__init__()
        self.data = data  # Use the actual data DataFrame
        
        # Define the action space (Green signal times for 4 directions)
        self.action_space = Box(low=10.0, high=120.0, shape=(4,), dtype=np.float32)  # Continuous values for 4 directions
        
        # Define the observation space (traffic data excluding 'Direction')
        self.observation_space = Box(
            low=0.0,
            high=np.inf,
            shape=(len(data.columns) - 1,),  # Exclude 'Direction'
            dtype=np.float32
        )
        
        self.state = None
        self.current_step = 0
        self.reset()

    def reset(self, seed=None, options=None):
        """Resets the environment to an initial state."""
        # Handle the seed argument (optional)
        if seed is not None:
            np.random.seed(seed)

        # Reset current step and state
        self.current_step = 0
        self.state = self.data.iloc[self.current_step].drop('Direction').values  # Initial traffic state
        
        # Return the initial observation and an empty dictionary for `info`
        return self.state, {}


    def step(self, action):
        """
        Takes an action (green signal times) and calculates the next state, reward, and other details.

        Args:
        - action: Array of green signal times for each direction.

        Returns:
        - next_state: The next observed state.
        - reward: The reward for the current step.
        - done: Boolean indicating if the episode is over.
        - truncated: Boolean indicating if the episode was truncated.
        - info: Additional information.
        """
        green_times = action
        orange_time = 3  # Fixed orange signal time
        
        # Simulate the waiting time based on action and traffic density
        waiting_time = sum(
            self.state[3:] / (green_times + orange_time)  # Traffic density divided by total signal time
        )
        reward = -waiting_time  # Negative reward to minimize waiting time
        
        # Transition to the next state
        self.current_step = (self.current_step + 1) % len(self.data)  # Loop through the data cyclically
        next_state = self.data.iloc[self.current_step].drop('Direction').values
        
        # Mock traffic simulation: Update state with slight random variations
        self.state = next_state + np.random.normal(0, 0.1, size=next_state.shape)  # Adding noise for realism
        
        # Indicate the episode does not end (non-episodic task)
        done = False
        
        # Set truncated to False (or implement logic to determine if the episode should be truncated)
        truncated = False
        
        info = {}
        # Example of adding truncation logic
        max_steps = 100  # Define a maximum number of steps for truncation
        truncated = self.current_step >= max_steps
                
        return self.state, reward, done, truncated, info


env = TrafficEnv(data)

