/**
 * Toggles a specific class on all elements with the given target class
 * @param {string} targetClass - The class to target elements
 * @param {string} className - The class to add or remove
 * @param {boolean} shouldAdd - True to add the class, false to remove it
 */
export const toggleClassOnTableInputs = (targetClass, className, shouldAdd) => {
  // Get all elements with the targetClass
  const elements = document.querySelectorAll('.' + targetClass);
  
  // Loop through each element
  elements.forEach(element => {
    if (shouldAdd) {
      // Add the class if it doesn't exist
      element.classList.add(className);
    } else {
      // Remove the class if it exists
      element.classList.remove(className);
    }
  });
}; 