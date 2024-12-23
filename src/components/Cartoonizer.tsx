import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import React, { useEffect, useRef, useState } from 'react';


const SIZE = 300;

const Cartoonizer = () => {
    
  const [model, setModel] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer>('');
  const [status, setStatus] = useState<string>('Please wait. Running CartoonGAN in your browser..');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

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

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.match('image.*')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if(e.target?.result){
          setImageSrc(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onCartoonize = (): void => {
    const img: HTMLImageElement = new Image();
    img.src = imageSrc as string;
    img.onload = () => predict(img);
  }

  const predict = async (imgElement: HTMLImageElement): Promise<void> => {
    let img = tf.browser.fromPixels(imgElement);
    const shape: [number, number, number] = img.shape;
    const [w, h] = shape;
    img = normalize(img);

    const t0 = performance.now();
    const result = await model.predict({ 'input_photo:0': img });
    const timer = performance.now() - t0;
    let img_out = result.squeeze().sub(tf.scalar(-1)).div(tf.scalar(2)).clipByValue(0, 1);
    const pad = Math.round(Math.abs(w - h) / Math.max(w, h) * SIZE);
    const slice = w > h ? [0, pad, 0] : [pad, 0, 0];
    img_out = img_out.slice(slice);

    draw(img_out, shape);
    console.log(Math.round(timer / 1000 * 10) / 10);
  };

  
  const normalize = (img: tf.Tensor) => {
    const [w, h] = img.shape;
    const pad: [number, number][] = w > h ? [[0, 0], [w - h, 0], [0, 0]] : [[h - w, 0], [0, 0], [0, 0]];
    img = img.pad(pad);
    img = tf.image.resizeBilinear(img, [SIZE, SIZE]).reshape([1, SIZE, SIZE, 3]);
    const offset = tf.scalar(127.5);

    return img.sub(offset).div(offset);
  };

  

  const draw = async (img: tf.Tensor, size: number[]) => {
    const scaleby = size[0] / img.shape[0];
    await tf.browser.toPixels(img, canvasRef.current);
    if (canvasRef.current && downloadRef.current) {
      // canvasRef.current.classList.remove('d-none');
      // canvasRef.current.classList.add('d-block');
      setStatus('');
      scaleCanvasToImage();
    }
  };

  const scaleCanvasToImage = (imgElement: HTMLImageElement = sourceRef.current as HTMLImageElement) => {
  if (canvasRef.current) {
    debugger
    const canvas = canvasRef.current;
    const tmpcan = document.createElement('canvas');
    const tctx = tmpcan.getContext('2d');

    // Store the current canvas content in a temporary canvas
    const cw = canvas.width;
    const ch = canvas.height;
    tmpcan.width = cw;
    tmpcan.height = ch;
    tctx?.drawImage(canvas, 0, 0);

    // Get the dimensions of the image element in the DOM
    const imgWidth = imgElement.width;
    const imgHeight = imgElement.height;

    // Resize the canvas to match the image dimensions
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    // Redraw the original content onto the resized canvas
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(tmpcan, 0, 0, cw, ch, 0, 0, imgWidth, imgHeight);

    // Optional: Update the download link
    // if (downloadRef.current) {
    //   downloadRef.current.href = canvas.toDataURL('image/jpeg');
    // }
  }
};
  return (
    <div style={{display: 'flex', gap:'24px'}}>        
        <div>
          <div>
            <label>
              {'Upload your Image'}
              <input type="file" onChange={onChange} accept={'image/*'} hidden />
            </label>
          </div>
          <img ref={sourceRef} src={imageSrc as string}  style={{maxWidth: '500px'}}/>
        </div>
        <button onClick={onCartoonize} className={'cartoonize__button'}>{'Cartoonize'}</button>        
        <div>
          <div>
            <label>{'Cartoonized Image'}</label>
            <a ref={downloadRef} download={'cartoon.jpeg'}>{'Download'}</a>
          </div>
          <canvas ref={canvasRef} />
        </div>
      </div>
  )
}
export { Cartoonizer };
