import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const [model, setModel] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>('../src/assets/fedal.jpg');
  const [status, setStatus] = useState<string>('Please wait. Running CartoonGAN in your browser..');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('wasm');
      const loadedModel = await tf.loadGraphModel('../src/models/web-uint8/model.json');
      setModel(loadedModel);
      // Warm up the model
      loadedModel.predict(tf.zeros([1, 1, 1, 3])).dispose();
    };

    loadModel();
  }, []);

  const normalize = (img: tf.Tensor) => {
    const [w, h] = img.shape;
    const pad = w > h ? [[0, 0], [w - h, 0], [0, 0]] : [[h - w, 0], [0, 0], [0, 0]];
    img = img.pad(pad);
    const size = 256;
    img = tf.image.resizeBilinear(img, [size, size]).reshape([1, size, size, 3]);
    const offset = tf.scalar(127.5);
    return img.sub(offset).div(offset);
  };

  const predict = async (imgElement: HTMLImageElement) => {
    let img = tf.browser.fromPixels(imgElement);
    const shape = img.shape;
    const [w, h] = shape;
    img = normalize(img);

    const t0 = performance.now();
    const result = await model.predict({ 'input_photo:0': img });
    const timer = performance.now() - t0;
    let img_out = result.squeeze().sub(tf.scalar(-1)).div(tf.scalar(2)).clipByValue(0, 1);
    const pad = Math.round(Math.abs(w - h) / Math.max(w, h) * 500);
    const slice = w > h ? [0, pad, 0] : [pad, 0, 0];
    img_out = img_out.slice(slice);

    draw(img_out, shape);
    console.log(Math.round(timer / 1000 * 10) / 10);
  };

  const draw = (img: tf.Tensor, size: number[]) => {
    const scaleby = size[0] / img.shape[0];
    tf.browser.toPixels(img, canvasRef.current);
    if (canvasRef.current && downloadRef.current) {
      canvasRef.current.classList.remove('d-none');
      canvasRef.current.classList.add('d-block');
      setStatus('');
      setTimeout(() => scaleCanvas(scaleby), 50);
    }
  };

  const scaleCanvas = (pct = 2) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const tmpcan = document.createElement('canvas');
      const tctx = tmpcan.getContext('2d');
      const cw = canvas.width;
      const ch = canvas.height;
      tmpcan.width = cw;
      tmpcan.height = ch;
      tctx?.drawImage(canvas, 0, 0);
      canvas.width *= pct;
      canvas.height *= pct;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(tmpcan, 0, 0, cw, ch, 0, 0, cw * pct, ch * pct);
      if (downloadRef.current) {
        downloadRef.current.href = canvas.toDataURL('image/jpeg');
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result);
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => predict(img);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
        <h1>Cartoonize your pictures</h1>
      <div style={{display: 'flex', gap:'24px'}}>        
          <div>
            <div>
              <label>
                {'Upload your Image'}
                <input type="file" onChange={handleImageChange} accept={'image/*'} hidden />
              </label>
            </div>
            <img ref={sourceRef} src={imageSrc as string}  style={{maxWidth: '500px'}}/>
          </div>        
          <div>
            <div>
              <label>{'Cartoonized Image'}</label>
              <a ref={downloadRef} download={'cartoon.jpeg'}>{'Download'}</a>
            </div>
            <canvas ref={canvasRef} style={{maxWidth: '500px'}}/>
          </div>
      </div>
    </div>
  );
};

export default App;
