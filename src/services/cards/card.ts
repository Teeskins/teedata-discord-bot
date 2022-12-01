import {
  Canvas,
  createCanvas,
  CanvasRenderingContext2D,
  registerFont
} from 'canvas';

// Register Teeworlds font
registerFont('./data/fonts/komikax.ttf', { family: 'Komikax' })

import ICard from '../../interfaces/card';
import Margin from '../../types/margin';
import { CanvasTextZone } from './textBox';
import {
  getCanvasFromFile,
  listFile,
  roundedImage,
  saveInDir
} from './utils';

abstract class AbstractCanvasCard implements ICard {
  margin: Margin = {
    top: 15, bottom: 15,
    left: 15, right: 15
  };

  protected font: string = '22px serif';
  protected background?: Canvas;
  protected textBoxes: { [key: string]: CanvasTextZone} = {};

  canvas: Canvas;
  protected ctx: CanvasRenderingContext2D;

  constructor(witdh: number, height: number) {
    this.canvas = createCanvas(witdh, height);
    this.ctx = this.canvas.getContext('2d');
  }

  setFont(font: string): this {
    this.font = font;

    return this;
  }

  setMargin(margin: Margin): this {
    this.margin = margin;
    
    return this;
  }

  get maxWidth(): number {
    return this.canvas.width - this.margin.left - this.margin.right;
  }

  get maxHeight(): number {
    return this.canvas.height - this.margin.top - this.margin.bottom;
  }

  protected processTextBoxes(): this {
    for (const title of Object.keys(this.textBoxes)) {
      const box = this.textBoxes[title];
      
      this.pasteCanvas(
        box.canvas,
        box.x,
        box.y,
        box.w,
        box.h
      );
    }

    return this;
  }

  async process(): Promise<this> {
    // Background
    this.processBackground();

    // Texts boxes
    this.processTextBoxes();

    return this;
  }

  protected pasteCanvas(
    canvas: Canvas,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): this {
    this.ctx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      dx, dy, dw, dh
    );

    return this;
  }

  protected processBackground(): this {
    if (this.background === undefined) {
      return this;
    }

    // Apply a border radius to the canvas context
    roundedImage(
      this.ctx,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      15
    );

    this.ctx.clip();

    // Paste the background canvas to the rounded one
    this.pasteCanvas(
      this.background,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    
    return this;
  }

  async setBackground(path: string): Promise<this> {
    this.background =  await getCanvasFromFile(path);
    
    return this;
  }

  async setRandomBackground(bg_folder: string): Promise<this> {
    const path = bg_folder;
    const backgrounds = listFile(path);
    const index = Math.floor(Math.random() * (backgrounds.length - 1));
    const backgroundPath = path + backgrounds[index];

    await this.setBackground(backgroundPath);

    return this;
  }

  save(dirname: string, filename: string): this {
    saveInDir(dirname, filename, this.canvas);
    
    return this;
  }
}

export {
  AbstractCanvasCard
};
