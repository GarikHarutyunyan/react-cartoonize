import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import { useEffect, useState } from 'react';
import './App.css';
import { Cartoonizer } from './components/Cartoonizer';

const App: React.FC = () => {
  const [model, setModel] = useState<any>(null);


    useEffect(() => {
      const loadModel = async () => {
        await tf.setBackend('wasm');
        const loadedModel = await tf.loadGraphModel('../../src/models/web-uint8/model.json');
        setModel(loadedModel);
        // Warm up the model
        // loadedModel.predict(tf.zeros([1, 1, 1, 3])).dispose();
      };
  
      loadModel();
    }, []);

  return (
    <div>
      <h1>{'Cartoonize your pictures'}</h1>
      <Cartoonizer model={model} />
    </div>
  );
};

export default App;
