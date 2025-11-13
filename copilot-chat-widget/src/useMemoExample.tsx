import React from 'react';

function expensiveCalculation(arr1: number[], arr2: number[]) {
    console.log("debugging: calculation invoked: ", arr1, arr2)
  const localMerged = [...arr1, ...arr2];
  return localMerged;
}

let seq = 10;

export function UseMemoDemo() {
//   const [num1, setNum1] = React.useState([5]);
//   const [num2, setNum2] = React.useState([100]);
  const [tick, setTick] = React.useState(0);

  // expensiveCalculation runs only when `num` changes
  //const memoizedValue = React.useMemo(() => expensiveCalculation(num1, num2), [num1, num2]);
  let num1 = [5];
  let num2 = [100];
  const memoizedValue1 = (num1: number[], num2: number[]) => {
    return React.useMemo(() => expensiveCalculation(num1, num2), [num1, num2]);
  }
  return (
    <div>
      <div>Result: {}</div>
      {/* <button onClick={() => setNum1(n => [...n])}>Increase num</button> */}
      <button onClick={() => {
        num1 = [...num1, seq++]
        console.log("debugging: num1 after click: ", memoizedValue1(num1, num2).join(","));
      }}>Increase num</button>

      <div style={{ marginTop: 12 }}>
        <div>Unrelated state: {tick}</div>
        <button onClick={() => setTick(t => t + 1)}>Bump tick</button>
      </div>
    </div>
  );
}
