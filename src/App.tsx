import '@tensorflow/tfjs-backend-wasm';
import './App.css';
import { Cartoonizer } from './components/Cartoonizer';

const App: React.FC = () => {
  return (
    <div>
      <h1>{'Cartoonize your pictures'}</h1>
      <Cartoonizer />
    </div>
  );
};

export default App;
