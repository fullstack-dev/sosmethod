import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ToastController, Toast, Modal, ModalController, ModalOptions } from 'ionic-angular';

import { ProgramService } from '../../app/services/program.service';
import { CommonService } from '../../app/services/common.service';
import { SessionService } from '../../app/services/session.service';
import { ToolService } from '../../app/services/tool.service';
import { SubscriptionService } from '../../app/services/subscription.service';


/**
 * Generated class for the EmpowerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const essentialsProgramId = 22;
const essentials5ProgramClassId = 24;
const essentials11ProgramClassId = 25;

@IonicPage()
@Component({
  selector: 'page-empower',
  templateUrl: 'empower.html',
})
export class EmpowerPage implements OnInit {

  programTypes = [];
  programTypesMap = {};
  programs = [];

  showingPrograms = {};

  hasSubscription = false;
  hasCompletedEssentials5 = false;
  hasCompletedEssentials11 = false;

  hasCompletedFirstClass = {};

  programStatusesFetched = false;

  errorToast: Toast;

  loadingPrograms = true;
  failedLoadingPrograms = false;

  loadingTools = true;
  failedLoadingTools = false;

  constructor(
    private navCtrl: NavController,
    private programService: ProgramService,
    private toastController: ToastController,
    private commonService: CommonService,
    private sessionService: SessionService,
    private toolService: ToolService,
    private subscriptionService: SubscriptionService,
    private modal: ModalController,
  ) { }

  ngOnInit() {

    this.getPrograms();

    this.getTools();

    this.sessionService.currentUser().subscribe(result => {
      console.log('this.subscriptionService.hasSubscription', this.subscriptionService.hasSubscription);
      if (
        this.subscriptionService.hasSubscription || 
        (result.user && result.user.current_subscription)
      ) {
        this.hasSubscription = true;

        // This is checking for completion of 5 day essentials
        this.programService.showProgramClass({
          id: essentials5ProgramClassId,
          user_id: this.commonService.getData('user')['id']
        }).subscribe(result => {
          this.hasCompletedEssentials5 = result.user_classes
            .map(userClass => {
              return userClass.status === 'COMPLETE';
            })
            .reduce((accumulator, current) => {
              return accumulator && current;
            });
          if(this.hasCompletedEssentials5 && this.hasCompletedEssentials11) {
            this.showingPrograms['essentials'] = false;
            this.showingPrograms['discovery'] = true;
          }
        });
        // This is checking for completion of 11 day essentials
        this.programService.showProgramClass({
          id: essentials11ProgramClassId,
          user_id: this.commonService.getData('user')['id']
        }).subscribe(result => {
          this.hasCompletedEssentials11 = result.user_classes
            .map(userClass => {
              return userClass.status === 'COMPLETE';
            })
            .reduce((accumulator, current) => {
              return accumulator && current;
            });
          if(this.hasCompletedEssentials5 && this.hasCompletedEssentials11) {
            this.showingPrograms['essentials'] = false;
            this.showingPrograms['discovery'] = true;
          }
        });

        // This is the second place that the statuses are fetched if they havent been yet.
        if(!this.programStatusesFetched) {
          this.fetchProgramCompletionStatuses();
        }
      }
    });
  }

  getPrograms() {
    this.loadingPrograms = true;
    this.failedLoadingPrograms = false;
    this.programService.index().subscribe(result => {
      const programs = result.programs;
      programs.sort((x, y) => x.order - y.order);
      programs.map(program => {

        // ensure program classes are sorted
        program.program_classes = program.program_classes.sort((a, b) => a.order - b.order);

        // a hack for essentials since the type does not exist in the api
        if(program.id === essentialsProgramId) {
          program.program_type = 'essentials';
          this.programTypesMap['essentials'] = [
            program
          ];
          this.showingPrograms['essentials'] = true;
          return;
        }
        
        if(!this.programTypesMap[program.program_type]) {
          this.programTypesMap[program.program_type] = [];
          this.programTypes.push(program.program_type);
        }
        this.programTypesMap[program.program_type].push(program);
      });


      this.programTypes = this.programTypes.sort();
      // a little hacky to add it after the sort, but works for now. better technique needed like a sort order for types.
      this.programTypes.unshift('essentials');

      // remove meditations to add it last
      this.programTypes.pop();
      this.programTypes.push('tool');
      this.programTypes.push('meditation');

      // we trigger this here and after fetching the user just in case on finishes in a different order than the other than normal
      if(this.hasSubscription && !this.programStatusesFetched) {
        this.fetchProgramCompletionStatuses();
      }
      this.loadingPrograms = false;
    }, error => {
      setTimeout(() => {
        this.loadingPrograms = false;
        this.failedLoadingPrograms = true;
      }, 3000);
    });
  }

  getTools() {
    this.loadingTools = true;
    this.failedLoadingTools = false;
    this.toolService.index().subscribe(toolCategories => {
      // we need to coerce tools into the same shape as programs to more easily use the data in the template
      this.programTypesMap['tool'] = toolCategories.map(category => {
        return {
          label: category.category,
          program_classes: category.tools.sort((a, b) => {
            return a.order - b.order;
          }),
          program_type: 'tool',
        };
      });
      console.log('programTypesMap["tools"]', this.programTypesMap['tool']);
      this.loadingTools = false;
    }, error => {
      setTimeout(() => {
        this.loadingTools = false;
        this.failedLoadingTools = true;
      }, 3000);
    });
  }

  fetchProgramCompletionStatuses() {
    // fetch completion values 5-minute classes
    if(this.programTypesMap['discovery']) {
      this.programTypesMap['discovery'].map(program => {
        this.programService.showProgramClass({
          id: program.program_classes[0].id,
          user_id: this.commonService.getData('user')['id']
        }).subscribe(result => {
          if(result.user_classes.length > 0) {
            const hasCompletedFirstClass = result.user_classes
              .map(userClass => {
                return userClass.status === 'COMPLETE';
              })
              .reduce((accumulator, current) => {
                return accumulator && current;
              });

            // we mark the first class as complete for simplicity elsewhere.
            this.hasCompletedFirstClass[program.program_classes[0].id] = true;

            if(hasCompletedFirstClass) {
              this.hasCompletedFirstClass[program.program_classes[1].id] = true;
            }
          }
        });
      });

      this.programStatusesFetched = true;
    }
  }

  sectionTitleFromType(programType) {
    switch(programType) {
      case 'essentials':
        return 'Quick Start';
      case 'discovery':
        return 'Discovery Programs';
      case 'meditation':
        return 'Daily Meditations';
      case 'tool':
        return 'Life Tools';
      default:
        return '';
    }
  }

  sectionDescriptionFromType(programType) {
    switch(programType) {
      case 'essentials':
        return 'Your SOS journey begins here';
      case 'discovery':
        return 'Explore science & holistic wisdom';
      case 'meditation':
        return 'Rewire mind for inspired solutions';
      case 'tool':
        return 'Soothe, revitalize, and empower';
      default:
        return '';
    }
  }

  ionViewDidEnter() {
    let push_popup_status = localStorage.getItem('push_popup_status');
    if(push_popup_status == 'first' || push_popup_status == 'complete') {
      setTimeout(() => {
        this.openModal();
      }, 6000);
    }
  }

  ionViewWillEnter() {
    
  }

  ionViewWillLeave() {
    if(this.errorToast) {
      this.errorToast.dismissAll();
    }
  }

  hasCompletedEssentials() {
    return this.hasCompletedEssentials5 && this.hasCompletedEssentials11;
  }

  getBackgroundUrl(programClass) {
    if(programClass.image && programClass.image.url) {
      return `url(${programClass.image.url})`;
    }
    return '';
  }

  clickedProgramClass(programClass, program) {
    if(this.shouldShowLockIcon(programClass, program)) {
      if(!this.hasSubscription) {
        this.navCtrl.push('SubscribePage');
      } else if(!this.errorToast) {
        let message = 'You must first finish the 5 day and 11 day Essentials.';

        if(!this.hasCompletedEssentials5) {
          message = 'You must first finish the 5 day Essentials.';
        }

        if (
          this.hasCompletedEssentials && 
          program.program_type === 'discovery' &&
          !this.hasCompletedFirstClass[programClass.id]
        ) {
          message = 'You must first finish the 5 day program.'
        }

        this.errorToast = this.toastController.create({
          message,
          cssClass: 'error-toast',
          position: 'middle',
          showCloseButton: true,
          closeButtonText: 'OK',
        });

        this.errorToast.onDidDismiss(() => {
          this.errorToast = null;
        });

        this.errorToast.present();
      }
    } else {
      if(program.program_type === 'tool') {
        this.navCtrl.push('ToolPage', {
          toolId: programClass.id,
        });
      } else {
        this.navCtrl.push('ProgramPage', {
          programClassId: programClass.id,
          programType: program.program_type,
          programId: program.id
        });
      }
    }
  }

  shouldShowFreeIcon(programClass, program) {
    return (!this.hasSubscription && !programClass.payment_required);
  }

  shouldShowLockIcon(programClass, program) {

    // 5 day essentials is always free
    if(programClass.id === essentials5ProgramClassId) {
      return false;
    }

    // 11 day essentials is free, but requires completing the 5 day first
    if(programClass.id === essentials11ProgramClassId) {
      return !this.hasCompletedEssentials5;
    }

    if(this.hasSubscription) {
      return (
        !this.hasCompletedEssentials() &&
        programClass.locked &&
        program.program_type !== 'discovery'
      ) || (
        program.program_type === 'discovery' &&
        !this.hasCompletedFirstClass[programClass.id]
      );
    }

    return programClass.payment_required;
  }

  toggleProgram(programId) {
    this.showingPrograms[programId] = !this.showingPrograms[programId];
  }

  getProgramIcon(programType) {
    switch(programType) {
      case 'essentials':
        return './assets/imgs/icons/empower-section-clock-200.png';
      case 'discovery':
        return './assets/imgs/icons/empower-section-bulb-200.png';
      case 'tool':
        return './assets/imgs/icons/empower-section-tools-200.png';
      default:
        return './assets/imgs/icons/empower-section-orb-200.png';
    }
  }

  openModal() {

    const myModalOptions: ModalOptions = {
      enableBackdropDismiss: false
    };

    const myModal: Modal = this.modal.create('PushPopupPage', { }, myModalOptions);

    myModal.present();

    myModal.onDidDismiss(() => {
      console.log("I have dismissed.");
      this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
    });

    myModal.onWillDismiss(() => {
      
    });

  }

}
