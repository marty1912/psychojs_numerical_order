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
import {Vs_stim} from './lib/grid_stim.js';
import {Phon_stim} from './lib/phon_stim.js';


class StaircaseScheduler extends Scheduler{
    constructor(psychojs,mode){
        super(psychojs);
        this.psychojs = psychojs;
        if (mode == "phon")
        {
            this.stim_class = Phon_stim;
        }
        else
        {

            this.stim_class =Vs_stim ;
        }

        for(let i= 0;i<10;i++)
        {
        this.add(this.loopHead);
        this.add(this.loopBodyEachFrame);
        }

        // start with difficulty 7
        this.current_difficulty = 7;

        this.fixation_time_1 = 4;
        this.test_time = 2;
        this.fixation_time_2 = 1;
    }



    setupTimes(){

        this.learn_time = 0.4 * this.stimpair.learn.getDifficulty();

        this.total_loop_time = this.learn_time+this.fixation_time_1+this.test_time+this.fixation_time_2;

        this.t_learn_start = 0;
        this.t_learn_end = this.learn_time;

        this.t_test_start = this.learn_time+this.fixation_time_1;
        this.t_test_end = this.learn_time+this.fixation_time_1+this.test_time;

    }

    loopHead(){

        this.stimpair = this.stim_class.getPairForTrial(this.current_difficulty,this.psychojs.window,1.5,false);

        this.setupTimes();

        this.keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});

        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock

        this.all_pressed_keys = [];

        return Scheduler.Event.NEXT;
    }


    loopBodyEachFrame(){

    let time_adjusted_with_frame = 0;
        let total_trial_time = 10;

        //------Loop for each frame ------
    let continueRoutine = true; // until we're told otherwise
    // get current time
    let t = this.clock.getTime();
    this.frameN = this.frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    if (t >= this.t_learn_start && this.stimpair.learn.status === PsychoJS.Status.NOT_STARTED) {
        console.log("this.stimpair.learn activated..");
      // keep track of start time/frame for later
      this.stimpair.learn.tStart = t;  // (not accounting for frame time here)
      this.stimpair.learn.frameNStart = this.frameN;  // exact frame index
      
      this.stimpair.learn.setAutoDraw(true);
    }

        // TODO set time before so we dont call anything each frame..
    time_adjusted_with_frame = this.t_learn_end - this.psychojs.window.monitorFramePeriod * 0.75;  // most of one frame period left
    if (this.stimpair.learn.status === PsychoJS.Status.STARTED && t >= time_adjusted_with_frame) {

      this.stimpair.learn.setAutoDraw(false);
    }


    if (t >= this.t_test_start && this.stimpair.test.status === PsychoJS.Status.NOT_STARTED) {
        console.log("this.stimpair.test acticated..");
      // keep track of start time/frame for later
      this.stimpair.test.tStart = t;  // (not accounting for frame time here)
      this.stimpair.test.frameNStart = this.frameN;  // exact frame index
      
      this.stimpair.test.setAutoDraw(true);
    }

    time_adjusted_with_frame = this.t_test_end - this.psychojs.window.monitorFramePeriod * 0.75;  // most of one frame period left
    if (this.stimpair.test.status === PsychoJS.Status.STARTED && t >= time_adjusted_with_frame) {

      this.stimpair.test.setAutoDraw(false);
    }

    // enable keyboard presses
    if (t >= this.t_test_start && this.keyboard.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
       
      this.keyboard.tStart = t;  // (not accounting for frame time here)
      this.keyboard.frameNStart = this.frameN;  // exact frame index
      
        console.log("in activate keyboard");
      // keyboard checking is just starting
      this.keyboard.clock.reset();
      this.keyboard.start();
      this.keyboard.clearEvents();
        // TODO do this for better timing!!
      //this.psychojs.window.callOnFlip(function() { this.keyboard.clock.reset(); });  // t=0 on next screen flip
      //this.psychojs.window.callOnFlip(function() { this.keyboard.start(); }); // start on screen flip
      //this.psychojs.window.callOnFlip(function() { this.keyboard.clearEvents(); });
    }

    time_adjusted_with_frame = this.t_test_end - this.psychojs.window.monitorFramePeriod * 0.75;  // most of one frame period left
    if (this.keyboard.status === PsychoJS.Status.STARTED && t >= time_adjusted_with_frame) {
      this.keyboard.stop();
    }

    if (this.keyboard.status === PsychoJS.Status.STARTED) {
      let theseKeys = this.keyboard.getKeys({keyList: ['j', 'k', 's'], waitRelease: false});
      this.all_pressed_keys = this.all_pressed_keys.concat(theseKeys);
    }




        if (t > total_trial_time){
            continueRoutine = false;
        }


    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
        this.current_difficulty++;
      return Scheduler.Event.NEXT;
    }
}

    loopEnd(){

    }


    }


export {StaircaseScheduler};
