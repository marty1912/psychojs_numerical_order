/********************* 
 * Test_Builder Test *
 *********************/

import { PsychoJS } from './lib/core-2020.1.js';
import * as core from './lib/core-2020.1.js';
import { TrialHandler } from './lib/data-2020.1.js';
import { Scheduler } from './lib/util-2020.1.js';
import * as util from './lib/util-2020.1.js';
import * as visual from './lib/visual-2020.1.js';
import * as sound from './lib/sound-2020.1.js';


class InstuctionsScheduler extends Scheduler{
    constructor(psychojs,text="TODO: get instructions here\n press j or k to continue.",correct_key='j',pause_after=4){
        super(psychojs);
        this.psychojs = psychojs;
        this.text = text;

        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock

        this.valid_keys = ['j', 'k'];
        // incase we want to use it for our instructions somehow..
        this.correct_key = correct_key;

        this.fixation_time = pause_after;

        this.setupSchedule();

    }


    // sets up the schedule of the staircase procedure
    setupSchedule(){
        // setup the schedule
        this.add(this.instructionsInit);
        this.add(this.showInstructions);
        this.add(this.showFixation);
            }

    instructionsInit(){

    this.instructions = new visual.TextStim({
    win: this.psychojs.window,
    name: 'text',
    text: this.text,
    font: 'Arial',
    units: undefined, 
    pos: [0, 0], height: 0.1,  wrapWidth: undefined, ori: 0,
    color: new util.Color('black'),  opacity: 1,
    depth: 0.0 
  });

    this.keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});

    this.instructions.setAutoDraw(true);

    this.clock.reset();

      return Scheduler.Event.NEXT;
    }

    showInstructions(){

        let t=this.clock.getTime();
    let time_adjusted_with_frame= 0
    let t_keyboard_enable= 3

    time_adjusted_with_frame = this.t_test_end - this.psychojs.window.monitorFramePeriod * 0.75;  // most of one frame period left

    // enable keyboard presses
    if (t >= t_keyboard_enable && this.keyboard.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
       
      console.log("keyboard activated..");
      this.keyboard.tStart = t;  // (not accounting for frame time here)
      this.keyboard.frameNStart = this.frameN;  // exact frame index
      
        // we do this at window flip for better timing!!
      this.psychojs.window.callOnFlip(function(clock) { clock.reset(); },this.keyboard.clock);  // t=0 on next screen flip
      this.psychojs.window.callOnFlip(function(keyboard) { keyboard.start(); },this.keyboard); // start on screen flip
      this.psychojs.window.callOnFlip(function(keyboard) { keyboard.clearEvents(); },this.keyboard);
    }

    if (this.keyboard.status === PsychoJS.Status.STARTED) {
      let theseKeys = this.keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
        for (let i = 0; i< theseKeys.length ; i++){

            let this_key = theseKeys[i];
        if( this.valid_keys.includes(this_key.name)){
            this.instructions.setAutoDraw(false);
              this.keyboard.stop();
            
            return Scheduler.Event.NEXT;
        }
        }
    }


            if (this.psychojs.experiment.experimentEnded || this.psychojs.eventManager.getKeys({keyList:['escape']}).length > 0) {
            this.psychojs.window.close();
              this.psychojs.quit({message: "Die [Escape] Taste wurde gedrückt. Das Experiment wurde abgebrochen. Danke für Ihre Teilnahme.", isCompleted: true});
              return Scheduler.Event.QUIT; 
            }
      return Scheduler.Event.FLIP_REPEAT;
    }

    showFixation(){

        let continueRoutine = true;
        let t = this.clock.getTime();


        // check if we exit the loop now.
        if (t > this.fixation_time){

            continueRoutine = false;
        }

            if (this.psychojs.experiment.experimentEnded || this.psychojs.eventManager.getKeys({keyList:['escape']}).length > 0) {
            this.psychojs.window.close();
              this.psychojs.quit({message: "Die [Escape] Taste wurde gedrückt. Das Experiment wurde abgebrochen. Danke für Ihre Teilnahme.", isCompleted: true});
              return Scheduler.Event.QUIT; 
            }


        this.frameN = this.frameN + 1;// number of completed frames (so 0 is the first frame)
        // refresh the screen if continuing
        if (continueRoutine) {
            return Scheduler.Event.FLIP_REPEAT;
        } else {
            return Scheduler.Event.NEXT;
        }
    }

    
    }


export {InstuctionsScheduler};
