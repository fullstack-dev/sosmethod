import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

  private colors = {
    blue: {
      start: '#006196',
      end: '#45C5BF',
    },
    green: {
      start: '#669966',
      end: '#99cc66',
    },
    yellow: {
      start: '#B98D2B',
      end: '#DFC142',
    },
    purple: {
      start: '#882F6F',
      end: '#CB6F91',
    },
    pink: {
      start: '#BB3F6B',
      end: '#F77940',
    },
    orange: {
      start: '#FD604E',
      end: '#F77940',
    },
  };

  private rainbowColors = [
    'FF3558',
    'FD604E',
    'F77940',
    '45C5BF',
    '008FBC',
    '006196',
  ];

  constructor() {
  }

  getColor(color) {
    return this.colors[color];
  }

  // adapted from: https://gist.github.com/maxwells/8251275
  convertHexToRgb(hex) {
    const match = hex.replace(/#/,'').match(/.{1,2}/g);
    return {
      r: parseInt(match[0], 16),
      g: parseInt(match[1], 16),
      b: parseInt(match[2], 16)
    };
  }

  // adapted from: https://gist.github.com/maxwells/8251275
  findColorBetween(colorName, percentage) {
    const color = this.getColor(colorName);
    const startRgb = this.convertHexToRgb(color.start);
    const endRgb = this.convertHexToRgb(color.end);
    const newColor = {};
    ['r', 'g', 'b'].map((c) => {
      newColor[c] = Math.round(startRgb[c] + (endRgb[c] - startRgb[c]) * percentage / 100);
    })
    return this.rgbToHex(newColor['r'], newColor['g'], newColor['b']);
  }

  findColorBetweenRainbowColors(percentage) {

    if(percentage === 0) {
      return this.rainbowColors[0];
    }

    if(percentage === 100) {
      return this.rainbowColors[5];
    }

    const index = Math.floor(percentage / 20);
    const startColor = this.rainbowColors[index];
    const endColor = this.rainbowColors[index + 1];

    const adjustedPercentage = (percentage % 20) / 20 * 100;

    const startRgb = this.convertHexToRgb(startColor);
    const endRgb = this.convertHexToRgb(endColor);

    const newColor = {};
    ['r', 'g', 'b'].map((c) => {
      newColor[c] = Math.round(startRgb[c] + (endRgb[c] - startRgb[c]) * adjustedPercentage / 100);
    })
    return this.rgbToHex(newColor['r'], newColor['g'], newColor['b']);
  }

  componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  rgbToHex(r, g, b) {
    return "" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

}