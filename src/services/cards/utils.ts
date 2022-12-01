import * as fs from 'fs';
import {
  Canvas,
  createCanvas,
  loadImage,
  CanvasRenderingContext2D,
  Image,
} from 'canvas';

import { FileError} from '../../errors'

function saveInDir(dirname: string, filename: string, canvas: Canvas) {
  // Create directory if it doesnt exist
  if (fs.existsSync(dirname) === false) {
    fs.mkdirSync(dirname);
  }

  // Save the element, only PNGs
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${dirname}/${filename}`, buffer);
}

function listFile(path: string): string[] {
  const ret = fs.readdirSync(path);

  return ret;
}

async function getCanvasFromFile(path: string): Promise<Canvas> {
  let img: Image;

  // Load image
  try {
    img = await loadImage(path);
  } catch (err) {
    throw new FileError('Unable to get the image ' + path);
  }

  // If everything is OK, it creates the canvas and the context
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return canvas;
}

function roundedImage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export {
  saveInDir,
  listFile,
  getCanvasFromFile,
  roundedImage
};
