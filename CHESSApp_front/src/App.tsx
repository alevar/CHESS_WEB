import logo from "./logo.svg"
import { Counter } from "./features/counter/Counter"
import "./App.css"
import { useEffect } from "react"

function App() {

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:5000/api/main/globalData")
      const data = await response.json()
      console.log(data)
    }
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Counter />
      </header>
    </div>
  )
}

export default App
