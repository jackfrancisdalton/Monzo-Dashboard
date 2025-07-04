import './App.css'
import { useMonzoData } from './Hooks/monzo-data.hook';

function App() {
  const { balance } = useMonzoData();
  return (
    <>
      <div>app</div>
    </>
  )
}

export default App
