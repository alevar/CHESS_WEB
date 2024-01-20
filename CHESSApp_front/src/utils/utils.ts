interface NestedObject {
    [key: string]: number | NestedObject;
}
  
  export const sum_of_leaves = (obj: NestedObject): number => {
    let total = 0;
  
    for (const key in obj) {
      if (typeof obj[key] === 'number') {
        // If it's a terminal number, add it to the total
        total += obj[key] as number;
      } else if (typeof obj[key] === 'object') {
        // If it's a nested object, recursively call the function
        total += sum_of_leaves(obj[key] as NestedObject);
      }
    }
  
    return total;
  };
  