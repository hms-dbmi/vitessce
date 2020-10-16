import tinycolor from 'tinycolor2';

/**
 * Execute a callback function based on a keypress event.
 * @param {object} event The event from onKeyPress
 * @param {string} key The key identifier to match.
 * @param {Function} callback The function to execute.
 */
export function callbackOnKeyPress(event, key, callback) {
  if (event.key === key) {
    event.preventDefault();
    callback();
  }
}

/**
 * Convert an array of [r, g, b] numbers to a hex color.
 * @param {number[]} rgbArray The color [r, g, b] array.
 * @returns {string} The hex color as a string.
 */
export function colorArrayToString(rgbArray) {
  return tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHexString();
}

/**
 * Convert a string color representation to an array of [r,g,b].
 * @param {string} colorString The color as a string.
 * @returns {number[]} The color as an array.
 */
export function colorStringToArray(colorString) {
  const colorObj = tinycolor(colorString).toRgb();
  return [colorObj.r, colorObj.g, colorObj.b];
}

/**
 * Get a string of help text for coloring a particular hierarchy level.
 * @param {integer} i The level. 1 for cluster, 2 for subcluster, etc.
 * @returns {string} The tooltip text for coloring the level.
 */
export function getLevelTooltipText(i) {
  if (i === 0) return 'Color by hierarchy';
  if (i <= 2) {
    const subs = j => ('sub'.repeat(j));
    return `Color by ${subs(i - 1)}cluster`;
  }
  return `Color by cluster level ${i}`;
}
