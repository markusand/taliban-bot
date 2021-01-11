/* Check thing is a String */
export const isString = thing => typeof thing === 'string' || thing instanceof String;

/* Ensure thing is an array */
export const array = thing => (Array.isArray(thing) ? thing : [thing]);
