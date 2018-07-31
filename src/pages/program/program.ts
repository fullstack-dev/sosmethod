import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Platform, ModalController, ViewController } from 'ionic-angular';
import { AudioTrackComponent } from 'ionic-audio';
import {
  Idle,
  WindowInterruptSource,
  DocumentInterruptSource,
} from '@ng-idle/core';
import { IsDebug } from '@ionic-native/is-debug';

import { Subscription } from 'rxjs/Subscription';

import { ProgramService } from '../../app/services/program.service';
import { CommonService } from '../../app/services/common.service';
import { UserClassService } from '../../app/services/user-class.service';
import { BackgroundService } from '../../app/services/background.service';

@IonicPage()
@Component({
  selector: 'page-program',
  templateUrl: 'program.html',
})
export class ProgramPage implements AfterViewInit, OnDestroy {

  programClass;
  programType;
  program;
  classDays = [];
  currentClassDay;
  latestClassDay;
  audioInfo = {
    src: '',
    artist: 'SOS Method',
    title: '',
    art: '',
    preload: 'metadata'
  };
  progressHack = -1;
  progressHistory = 0;
  shouldAutoPlay = false;
  backgrounds = [];
  selectedBackgroundUrl = '';
  idleState = false;
  shouldShowSurvey = false;
  ignoreTrackFinished = false;
  audioEventsAdded = false;
  showingSpinner = true;
  isDebug = false;

  idleEndSub: Subscription;
  idleStartSub: Subscription;

  navDisabled = false;

  playingHackInterval;

  failedLoadingData = false;
  loadingData = true;

  @ViewChild('audio') audioTrack: AudioTrackComponent;
  @ViewChild('video') video: ElementRef;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private programService: ProgramService,
    private commonService: CommonService,
    private userClassService: UserClassService,
    private backgroundService: BackgroundService,
    private menuController: MenuController,
    private idle: Idle,
    private platform: Platform,
    private modalController: ModalController,
    private viewController: ViewController,
    private isDebugService: IsDebug,
  ) {

    if(!this.platform.is('cordova')) {
      this.isDebug = true;
    } else {
      this.isDebugService.getIsDebug().then(isDebug => {
        this.isDebug = isDebug;
      });
    }
  }


  ionViewDidEnter() {
    this.navDisabled = true;

    setTimeout(() => {
      this.navDisabled = false;
    }, 2000);
    console.log('ionViewDidEnter ProgramPage with id: ', this.navParams.get('programClassId'));

    this.backgroundService.getBackgrounds().subscribe(bgs => {
      this.backgrounds = bgs;
    });

    this.getProgramClass();

    // handling idle timeout setup and actions
    this.idle.setIdle(5);
    this.idle.setTimeout(0);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    const commonEvents = 'touchstart touchmove touchend touchcancel scroll click';
    this.idle.setInterrupts([
      new WindowInterruptSource(commonEvents),
      new DocumentInterruptSource(commonEvents),
    ]);


    this.idleEndSub = this.idle.onIdleEnd.subscribe(() => {
      setTimeout(() => {
        this.idleState = false
      }, 1000);
    });
    this.idleStartSub = this.idle.onIdleStart.subscribe(() => {
      this.idleState =
        this.audioTrack &&
        this.audioTrack.isPlaying &&
        this.selectedBackgroundUrl != '';
    });
    this.idle.watch();

    // Hacks for getting app to properly un-idle when resumed or made active
    document.addEventListener('active', this.interrupt);
    document.addEventListener('resume', this.interrupt);

    // hacky body listener that hacks around the ngIdle getting stuck after idling for ~30secs
    document.body.addEventListener('click', this.bodyClick);

    // set bg if it was passed in via the router
    if(this.navParams.get('bgVideo')) {
      this.selectedBackgroundUrl = this.navParams.get('bgVideo');
    }

    if(this.navParams.get('programId')) {
      this.programService.show(this.navParams.get('programId')).subscribe(result => {
        this.program = result.program;
      });
    } else {
      this.program = this.navParams.get('program');
    }

  }

  getProgramClass() {
    this.loadingData = true;
    this.failedLoadingData = false;
    this.programService.showProgramClass({
      id: this.navParams.get('programClassId'),
      user_id: this.commonService.getData('user')['id']
    }).subscribe(result => {
      // create map of class day id to completed boolean
      const userClassCompletions = {};
      const userClassIdsByProgramClassDayId = {};
      result.user_classes.map(userClass => {
        userClassCompletions[userClass.class_day_id] = userClass.status == 'COMPLETE';
        userClassIdsByProgramClassDayId[userClass.class_day_id] = userClass.id;
      });

      this.programClass = result.program_class;

      let allProgramDaysCompleted = true;
      this.classDays = result.class_days.sort((a, b) => {
        if(a.order > b.order) {
          return 1;
        } else if(a.order < b.order) {
          return -1;
        } else {
          return 0;
        }
      }).map(programClassDay => {


        programClassDay.completed = userClassCompletions[programClassDay.id];
        programClassDay.userClassId = userClassIdsByProgramClassDayId[programClassDay.id];

        if(allProgramDaysCompleted && !programClassDay.completed) {
          this.latestClassDay = programClassDay;
        }

        allProgramDaysCompleted = allProgramDaysCompleted && programClassDay.completed;

        if(
          (!this.currentClassDay && !programClassDay.completed) ||
          programClassDay.id === this.navParams.get('classDayId')
        ) {
          this.currentClassDay = programClassDay;
        }

        return programClassDay;
      });

      if(!this.currentClassDay) {
        if(allProgramDaysCompleted) {
          this.currentClassDay = this.classDays[0];
        } else {
          this.currentClassDay = this.classDays[this.classDays.length - 1];
        }
      }

      this.audioInfo.src = this.currentClassDay.file.url;
      this.audioInfo.title = `${this.currentClassDay.title}: ${this.currentClassDay.description}`;

      this.programType = this.navParams.get('programType');

      if(this.navParams.get('shouldShowSurvey')) {
        this.shouldShowSurvey = true;
      }

      if(this.currentClassDay.meditation_id && this.isSurveyDay()) {
        this.shouldShowSurvey = true;
      }

      // autoplay after loading only if the program page is the current page
      // or show survey if needed
      setTimeout(() => {
        if(this.programType !== 'meditation' && this.shouldShowSurvey) {
          this.showSurvey();
        } else if(this.audioTrack && this.navCtrl.getActive().instance instanceof ProgramPage) {
          this.audioTrack.play();
        }
      }, 500);
      this.loadingData = false;
    }, error => {
      setTimeout(() => {
        this.loadingData = false;
        this.failedLoadingData = true;
      }, 3000);
    });
  }

  isSurveyDay() {
    return (this.isFirstDay() || this.isLastDay()) ||
      (this.classDays.length > 5 && this.currentClassDay.order === 6) || 
      (this.classDays.length === 5 && this.currentClassDay.order === 3);
  }

  // had to be defined as a property instead of a class method due to weird binding bug (`this` pointed to document.body)
  bodyClick = (event) => {
    const element = event.target as Element;
    if(element.className === 'scroll-content') {
      this.interrupt();
    }
  }

  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad ProgramPage with id: ', this.navParams.get('programClassId'));
  // }

  ionViewWillLeave() {
    console.log('ionViewWillLeave ProgramPage');
    if(this.audioTrack) {
      this.audioTrack['_audioTrack'].stop();
      // force the audio to start loading empty data to halt the fetching of the other data
      this.audioInfo.src = '';
      this.audioTrack['_audioTrack'].load();
    }

    this.idle.stop();

    if(this.idleStartSub) {
      this.idleStartSub.unsubscribe();
    }
    if(this.idleEndSub) {
      this.idleEndSub.unsubscribe();
    }

    document.removeEventListener('active', this.interrupt);
    document.removeEventListener('resume', this.interrupt);
  }

  ngAfterViewInit() {
    this.video.nativeElement.loop = false;
    // hack autolooping for older android devices
    this.video.nativeElement.addEventListener('ended', function () {
      // in this function this points to the video element.
      this.pause();
      this.currentTime = 0;
      this.play();
    });
  }

  ngOnDestroy() {
    document.removeEventListener('active', this.interrupt);
    document.removeEventListener('resume', this.interrupt);
    document.body.removeEventListener('click', this.bodyClick);
  }

  interrupt() {
    // using a timeout because active and resume events will fire before the app is ready to do anything about it
    setTimeout(() => {
      this.idle.stop();
      this.idleState = false;
      this.idle.watch();
    }, 100);
  };

  goBack() {
    this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
  }

  // passing in the audio allows easier mocking for testing if needed
  playOrPausePressed(audio) {

    // This was used to prevent issues of the button being pressed while loading
    // It had to be commented out to support replaying a meditation after it has stopped.
    // There could be issues to address from commenting this out
    // if(!audio.hasLoaded) {
    //   return false;
    // }

    if(audio.isPlaying) {
      audio.pause();
    } else {
      audio.play();
      this.progressHack = -1;
    }
  }

  restartPressed(audio) {
    audio.seekTo(0);
    if(!audio.isPlaying) {
      this.progressHack = 0;
    }
  }

  rewindPressed(audio) {
    const seekTo = Math.max(0, (audio.progress - 10));
    audio.seekTo(seekTo);
    if(!audio.isPlaying) {
      this.progressHack = seekTo;
    }
  }

  fastForwardToEnd() {
    this.audioTrack.seekTo(this.audioTrack.duration - 5);
  }

  onTrackFinished(event) {
    // We have set this flag when the final day's survey is dismissed otherwise, handler shows us the survey again.
    if(this.ignoreTrackFinished) {
      return;
    }

    if(Math.round(this.progressHistory) < 100) {
      console.log('Finished event fired before end of audio track. Assuming navigation.');
      this.audioTrack['_audioTrack'].stop();
      return;
    }
    // reset it so that this only fires once per page
    this.progressHistory = 0;

    // mark class as complete. no need to listen for success/failure (yet)
    if(this.programType != 'meditation') {
      this.userClassService.update({
        id: this.currentClassDay.userClassId,
        status: 'COMPLETE'
      }).subscribe();

      let push_popup_status = localStorage.getItem('push_popup_status');
      if (push_popup_status == 'later') {
          localStorage.setItem('push_popup_status', 'complete');
      }
    }

    if(this.currentClassDay.meditation_id) {
      this.navCtrl.setPages([
        { page: 'EmpowerPage' },
        {
          page: 'ProgramPage',
          params: {
            programClassId: this.currentClassDay.meditation_id,
            programType: 'meditation',
            program: this.program,
            shouldAutoPlay: true,
            bgVideo: this.selectedBackgroundUrl,
            shouldShowSurvey: this.isSurveyDay(),
          }
        }
      ]);
    } else {
      if(this.shouldShowSurvey) {
        this.showSurvey(true);
      }
    }
  }

  normalizedProgress(audio: AudioTrackComponent) {
    let progress = 0;
    if(this.progressHack < 0) {
      progress = audio.progress;
    } else {
      progress = this.progressHack;
    }

    if(progress > 0) {
      this.showingSpinner = false;
    }

    let progressPercent = progress / audio.duration * 100;
    if(progressPercent > 0 && progressPercent > this.progressHistory) {
      this.progressHistory = progressPercent;
    }
    return progressPercent;
  }

  meditationChanged(event) {
    if(this.navDisabled) {
      return;
    }
    this.navCtrl.setPages([
      { page: 'EmpowerPage' },
      {
        page: 'ProgramPage',
        params: {
          programClassId: this.programClass.id,
          programType: 'meditation',
          program: this.program,
          classDayId: event.value,
          shouldAutoPlay: true,
          bgVideo: this.selectedBackgroundUrl,
          shouldShowSurvey: this.shouldShowSurvey,
        }
      }
    ]);
    this.audioTrack['_audioTrack'].stop();
  }

  classDayChanged(classDay) {
    if(this.navDisabled) {
      return;
    }
    let isNext = false;
    let previousWasCompleted = false;
    this.classDays.map(_classDay => {
      if(previousWasCompleted && classDay.id === _classDay.id) {
        isNext = true;
      }
      previousWasCompleted = _classDay.completed;
    });

    if(
      (classDay.id !== this.currentClassDay.id && 
      classDay.completed === true) ||
      isNext
    ) {
      this.navCtrl.setPages([
        { page: 'EmpowerPage' },
        {
          page: 'ProgramPage',
          params: {
            programClassId: this.programClass.id,
            programType: 'discovery',
            program: this.program,
            classDayId: classDay.id,
            shouldAutoPlay: true,
            bgVideo: this.selectedBackgroundUrl,
          }
        }
      ]);
    }

    this.audioTrack['_audioTrack'].stop();
  }

  showBackgrounds() {
    this.menuController.enable(false, 'main');
    this.menuController.enable(true, 'bgs');
    this.menuController.toggle('bgs');
  }

  setBackground(bgVideo) {
    // in specific cases we have to pause the audio when switching the background video
    // see the definition of shouldHackAroundAudioIssue() for more detail
    const shouldHackAroundAudioIssue = this.shouldHackAroundAudioIssue();
    if(shouldHackAroundAudioIssue) {
      this.audioTrack.pause();
    }
    this.selectedBackgroundUrl = this.backgroundService.videoBase + bgVideo;
    this.menuController.close('bgs');
    if(shouldHackAroundAudioIssue) {
      // once the video is loaded we can restart the audio(?)
      const listener = () => {
        this.audioTrack.play();
        this.video.nativeElement.removeEventListener('loadeddata',listener);
      };
      this.video.nativeElement.addEventListener('loadeddata', listener);
    }
  }

  // The issue is as described:
  //   If audio is playing
  //     clicking a new background will cause the audio to stop and become unstartable
  // Currently only experienced on Android 4.4
  shouldHackAroundAudioIssue() {
    const versions = this.platform.versions();
    if(!versions['android'] || !versions['android']['num']) {
      return false;
    }

    return (this.audioTrack.isPlaying && versions['android']['num'] < 5);
  }

  goToTool() {
    const modal = this.modalController.create('ToolPage', {
      toolId: this.currentClassDay.tool_id
    });
    modal.onWillDismiss(() => {
      this.interrupt();
    });
    modal.present();
  }

  showSurvey(isPostMeditation = false) {
    // There was an edge case that was trying to show the survey when program was null
    // That breaks things, so we just ignore that edge case by returning early
    if(!this.program) {
      return;
    }

    // we don't want to show the survey if the user navigates before we have time to show it
    if(!this.navCtrl.isActive(this.viewController)) {
      return;
    }

    if(this.audioTrack) {
      this.audioTrack.pause();
      this.idleState = false;
    } else {
      this.shouldAutoPlay = false;
    }

    const modal = this.modalController.create('SurveyPage', {
      survey: this.program.simple_survey,
      programId: this.program.id,
      programClassId: this.programClass.id,
      isPostMeditation,
    });

    modal.onWillDismiss(() => {
      // having a meditation id means we are on a program and should play the audio
      if(this.programType !== 'meditation' && this.navCtrl.isActive(this.viewController)) {
        this.audioTrack.play();
      }
    });

    modal.present();
  }

  isFirstDay() {
    return this.currentClassDay.meditation_id && this.currentClassDay.order === 1;
  }

  isLastDay() {
    return this.currentClassDay.meditation_id && this.currentClassDay.order === this.classDays.length;
  }

  shouldShowSpinner() {
    return this.showingSpinner;
  }


}
