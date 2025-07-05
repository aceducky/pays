import { useState } from "react";

function doSomething(c) {
  console.log("recalculated");
  return c * 10;
}
function App() {
  const [count1, setCount1] = useState(1);
  const c2 = doSomething(count1);
  const [count2, setCount2] = useState(1);
  return (
    <div>
      <div>{count1}</div>
      <button
        className="bg-blue-500 text-white p-3 rounded"
        onClick={() => setCount1(count1 + 1)}
      >
        increment count 1
      </button>
      <div>c2 {c2}</div>
      <div>{count2}</div>
      <button
        className="bg-blue-500 text-white p-3 rounded"
        onClick={() => setCount2(count2 + 1)}
      >
        increment count 2
      </button>
    </div>
  );
}

export default App;
