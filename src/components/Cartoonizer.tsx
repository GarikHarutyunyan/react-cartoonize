import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import React, {useRef, useState} from 'react';
import placeholderImg from '../../src/assets/image.png';
import './cartoonizer.css';

const SIZE: number = 300;
const LOADING_TEXT: string =
  'Please wait. Running CartoonGAN in your browser․․․';

interface ICartoonizerProps {
  model: any;
}

const Cartoonizer: React.FC<ICartoonizerProps> = ({model}) => {
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLCanvasElement | null>(null);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file?.type.match('image.*')) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onCartoonize = (): void => {
    const img: HTMLImageElement = new Image();
    img.src = imageSrc as string;
    setIsLoading(true);
    img.onload = async () => {
      await predict(img);
      setIsLoading(false);
    };
  };

  const predict = async (imgElement: HTMLImageElement): Promise<void> => {
    let img: any = tf.browser.fromPixels(imgElement);
    const shape: [number, number, number] = img.shape;
    const [w, h] = shape;
    img = normalize(img);

    const t0 = performance.now();
    const result = await model.predict({'input_photo:0': img});
    const timer = performance.now() - t0;
    let img_out = result
      .squeeze()
      .sub(tf.scalar(-1))
      .div(tf.scalar(2))
      .clipByValue(0, 1);
    const pad = Math.round((Math.abs(w - h) / Math.max(w, h)) * SIZE);
    const slice = w > h ? [0, pad, 0] : [pad, 0, 0];
    img_out = img_out.slice(slice);

    await draw(img_out);
    console.log(Math.round((timer / 1000) * 10) / 10);
  };

  const normalize = (img: any) => {
    const [w, h] = img.shape;
    const pad: [number, number][] =
      w > h
        ? [
            [0, 0],
            [w - h, 0],
            [0, 0],
          ]
        : [
            [h - w, 0],
            [0, 0],
            [0, 0],
          ];
    img = img.pad(pad);
    img = tf.image
      .resizeBilinear(img, [SIZE, SIZE])
      .reshape([1, SIZE, SIZE, 3]);
    const offset = tf.scalar(127.5);

    return img.sub(offset).div(offset);
  };

  const draw = async (img: any): Promise<void> => {
    await tf.browser.toPixels(img, canvasRef.current as HTMLCanvasElement);

    if (canvasRef.current) {
      scaleCanvasToImage();
    }
  };

  const scaleCanvasToImage = (
    imgElement: HTMLImageElement = sourceRef.current as HTMLImageElement
  ): void => {
    if (canvasRef.current) {
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
    }
  };

  const onUpload = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className={'cartoonizer'}>
      <div className={'cartoonizer__original-image-container'}>
        <div>
          <label>
            <a className={'cartoonizer__original-image-uploader'}>
              {'Upload Image'}
            </a>
            <input
              ref={fileInputRef as any}
              type={'file'}
              onChange={onChange}
              accept={'image/*'}
              hidden
            />
          </label>
        </div>
        <img
          ref={sourceRef}
          src={imageSrc ? (imageSrc as string) : placeholderImg}
          onClick={!imageSrc ? onUpload : undefined}
          className={'cartoonizer__original-image'}
        />
      </div>
      <button
        onClick={onCartoonize}
        disabled={!imageSrc}
        className={'cartoonizer__cartoonize-button'}
      >
        {'Cartoonize'}
      </button>
      <div>
        <div>
          <label>{'Cartoonized Image'}</label>
        </div>
        {isLoading ? <span>{LOADING_TEXT}</span> : null}
        <canvas ref={canvasRef} hidden={isLoading} />
      </div>
    </div>
  );
};

export {Cartoonizer};
