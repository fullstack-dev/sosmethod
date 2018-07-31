import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ReviewService {

  constructor() { }

  getReviews() {
    return Observable.of([
      {
        image: '1.jpg',
        name: 'Wade Davis, Ph.D. Ethnobotanist, Samuel Johnson award winning author of Into the Silence',
        location: '',
        text: `It was like being able to breathe again. Each new awareness was like a lens to see the world where problems became adventures to be dealt with in new ways.`,
        stars: 5,
        color: 'purple'
      },
      {
        image: '2.png',
        name: 'Dr. Monica Ling, Spinal Medicine Specialist, Prince of Wales Hospital',
        location: '',
        text: `SOS meditations are enjoyable, calming, and only take 5 minutes! It's great for all people to find stress relief in their lives as this has significant health benefits.`,
        stars: 5,
        color: 'blue'
      },
      {
        image: '3.jpg',
        name: 'Dr. Sue Jamieson, Harvard, award-winning Scottish physician',
        location: '',
        text: `SOS is the only method I’ve come across with scientifically based audio tracks that shift you into an actual state of stillness and peace.`,
        stars: 5,
        color: 'green'
      },
      {
        image: '4.jpg',
        name: 'Dr. Elliott Maynard, Ph.D. Marine Sciences, Author Brave New Mind, Advisory Board, Research Integrity Institute',
        location: '',
        text: `SOS Method has seamlessly interwoven electronic technology to create audio tapestries that exist in a class by themselves.`,
        stars: 5,
        color: 'blue'
      },
      {
        image: '5.jpg',
        name: 'Dr. Irene Conlan, Former Assistant Director Arizona Department of Health Services',
        location: '',
        text: `When I listen to SOS meditations, I’m cocooned in a wonderful, loving feeling and immediately relax. The more frequently I listen, the longer the peaceful feeling remains.`,
        stars: 5,
        color: 'purple'
      },
    ]);
  }

}