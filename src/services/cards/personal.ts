import { AbstractCanvasCard } from './card';
import ITextDescriptor from '../../interfaces/textDescriptor'
import { CanvasTextZone } from './textBox'

enum CardTitle {
  USERNAME = 'Username',
  CLANS = 'Clan(s)',
  SINCE = 'Playing since',
  GAMEMODES = 'Gamemode(s)',
  DESCRIPTION = 'Description',
}

class TwPersonalCard extends AbstractCanvasCard {
  constructor() {
    super(400, 460);
  }

  async process(): Promise<this> {
    this.processBackground();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.fill();

    this.processTextBoxes();

    return this;
  }

  private addTextBox(
    x: number, y: number,
    w: number, h: number,
    title: ITextDescriptor,
    content: ITextDescriptor
  ): this {
    if (x < this.margin.left) {
      x = this.margin.left;
    }
    if (x + w > this.canvas.width - this.margin.right) {
      w = (this.canvas.width - this.margin.right) - x;
    }
    if (y < this.margin.top) {
      y = this.margin.top;
    }
    if (y + h > this.canvas.height - this.margin.bottom) {
      h = (this.canvas.height - this.margin.bottom) - y;
    }

    const textBox = new CanvasTextZone(w, h)
      .setPos(x, y)
      .setColor('rgba(255, 255, 255, 0.1)')
      .setTitle(title)
      .setContent(content)
      .process()
    
    this.textBoxes[textBox.title.value] = textBox;
    
    return this;
  }

  setUsername(content: string): this {
    this.addTextBox(
      this.margin.left, this.margin.top,
      215, 80,
      {
        x: 0,
        y: 10,
        size: 16,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.50)',
        value: CardTitle.USERNAME
      },
      {
        x: 0,
        y: 45,
        size: 20,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.90)',
        value: content
      }
    );
    
    return this;
  }

  setSince(content: string): this {
    this.addTextBox(
      245, this.margin.top,
      150, 80,
      {
        x: 0,
        y: 10,
        size: 14,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.50)',
        value: CardTitle.SINCE
      },
      {
        x: 0,
        y: 45,
        size: 20,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.90)',
        value: content
      }
    );
    
    return this;
  }

  setGamemode(content: string): this {
    this.addTextBox(
      0, 110,
      11111, 80,
      {
        x: 0,
        y: 10,
        size: 16,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.50)',
        value: CardTitle.GAMEMODES
      },
      {
        x: 0,
        y: 45,
        size: 13,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.90)',
        value: content
      }
    );
    
    return this;
  }

  setClan(content: string): this {
    this.addTextBox(
      0, 205,
      11111, 80,
      {
        x: 0,
        y: 10,
        size: 16,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.50)',
        value: CardTitle.CLANS
      },
      {
        x: 0,
        y: 45,
        size: 13,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.90)',
        value: content
      }
    );
    
    return this;
  }

  setDescription(content: string): this {
    this.addTextBox(
      0, 300,
      11111, 160,
      {
        x: 0,
        y: 10,
        size: 16,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.50)',
        value: CardTitle.DESCRIPTION
      },
      {
        x: 0,
        y: 45,
        size: 13,
        font: 'Komika Axis',
        color: 'rgba(255, 255, 255, 0.90)',
        value: content
      }
    );
    
    return this;
  }
}

export {
  TwPersonalCard
};

