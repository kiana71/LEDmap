export function findMax(num1, num2) {
    return num1 > num2 ? num1 : num2;
  }


//   const flatWallDepth = parseFloat((selectedScreen?.Depth || 0) + (selectedMount?.["Depth (in)"] || 0));
//   (Depth){isNiche ? nicheDepth : flatWallDepth.toFixed(2)}
// <DimensionItem
// label="Width"
// value={
// selectedScreen?.["Screen Size"]
// ? (
// parseFloat(selectedScreen["Width"]) +
// (selectedScreen["Width"] < 55 ? 1.5 : 2)
// ).toFixed(2)
// : 0
// }
// {(parseFloat(selectedScreen["Width"]) + (selectedScreen["Width"] < 55 ? 1.5 : 2)).toFixed(2)}