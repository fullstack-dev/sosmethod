import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BackgroundService {

  videoBase = 'https://s3-us-west-2.amazonaws.com/sosmethod/';

  constructor() { }

  getBackgrounds() {
    return Observable.of([
      {
        video: 'shutterstock_v1927594.mp4',
        image: 'clouds.jpg',
        name: 'clouds',
      },
      {
        video: 'shutterstock_v1271068.mp4',
        image: 'dark_sky.jpg',
        name: 'dark_sky',
      },
      {
        video: 'shutterstock_v18169228.mp4',
        image: 'purple.jpg',
        name: 'purple',
      },
      {
        video: 'shutterstock_v2911900.mp4',
        image: 'autumn.jpg',
        name: 'autumn',
      },
      {
        video: 'shutterstock_v2721359.mp4',
        image: 'beach.jpg',
        name: 'beach',
      },
      {
        video: 'shutterstock_v5240417.mp4',
        image: 'rain_bird.jpg',
        name: 'rain_bird',
      },
      {
        video: 'shutterstock_v648469.mp4',
        image: 'water2.jpg',
        name: 'water2',
      },
      {
        video: 'shutterstock_v7486369.mp4',
        image: 'candle.jpg',
        name: 'candle',
      },
      {
        video: 'SOS-StarCave_1300x800_Loop-16_1211.mp4',
        image: 'cave.jpg',
        name: 'cave',
      },
    ]);
  }

}