/**
 * Simple function to increase a number by a step
 * @param {number} currentValue - The current number
 * @param {number} step - How much to increase by (default is 1)
 * @returns {number} - The new increased number
 */
export const increment = (currentValue, step = 1) => {
  return currentValue + step;
};

/**
 * Simple function to decrease a number by a step, but never go below 0
 * @param {number} currentValue - The current number
 * @param {number} step - How much to decrease by (default is 1)
 * @returns {number} - The new decreased number (never below 0)
 */
export const decrement = (currentValue, step = 1) => {
  return Math.max(0, currentValue - step);
};

/**
 * Creates a button click handler that increases a value
 * @param {Function} setValue - The function to update the value (like setState)
 * @param {number} step - How much to increase by (default is 1)
 * @returns {Function} - A function that can be used as an onClick handler
 */
export const createIncrementHandler = (setValue, step = 1) => {
  return (e) => {
    e.preventDefault(); // Stop the button from submitting forms
    setValue(prev => prev + step); // Increase the value by step
  };
};

/**
 * Creates a button click handler that decreases a value
 * @param {Function} setValue - The function to update the value (like setState)
 * @param {number} step - How much to decrease by (default is 1)
 * @returns {Function} - A function that can be used as an onClick handler
 */
export const createDecrementHandler = (setValue, step = 1) => {
  return (e) => {
    e.preventDefault(); // Stop the button from submitting forms
    setValue(prev => Math.max(0, prev - step)); // Decrease the value by step, but never below 0
  };
}; 