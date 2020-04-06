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
import {Staircase} from './lib/staircase.js';
import {InstuctionsScheduler} from './instructions_sheduler.js';


class StaircaseScheduler extends Scheduler{
    constructor(psychojs,mode="vis",correct_key='j'){
        super(psychojs);
        this.psychojs = psychojs;
        if (mode == "phon")
        {
            this.stim_class = Phon_stim;
        }
        else if(mode == "vis")
        {

            this.stim_class = Vs_stim ;
        }
        else
        {
            throw "invalid mode!"
        }

        this.staircase = new Staircase();
        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock

        this.valid_keys = ['j', 'k'];
        this.correct_key = correct_key;

        this.setupSchedule();

    }

    // the difficulty will be the mean of all the reversals of the staircase.
    // Use this function after the staircase procedure has finished!!
    getDifficulty(){
        let reversals = this.staircase.getReversals();
        let sum = 0;
        for(let i= 0;i<reversals.length;i++){
            sum+=reversals.val;
        }
        let mean = sum/reversals.length;

        return mean;
    }

    // sets up the schedule of the staircase procedure
    setupSchedule(){
        // setup the schedule
        this.add(new InstuctionsScheduler(this.psychojs));
        for(let i= 0;i<25;i++)
        {
        this.add(this.loopHead);
        this.add(this.loopBodyEachFrame);
        this.add(this.loopEnd);
        }
        this.add(this.saveData);
    }

     setupTimes(){

        this.fixation_time_1 = 4;
        this.test_time = 2;
        this.fixation_time_2 = 1;

        // set an initial fixation but only once
        this.initial_fixation = (this.initial_fixation == undefined) ? 4 : 0;

        this.learn_time = 0.4 * this.stimpair.learn.getDifficulty();

        this.total_loop_time = this.initial_fixation + this.learn_time+this.fixation_time_1+this.test_time+this.fixation_time_2;

        this.t_learn_start = this.initial_fixation;
        this.t_learn_end = this.initial_fixation + this.learn_time;

        this.t_test_start =this.initial_fixation+ this.learn_time+this.fixation_time_1;
        this.t_test_end = this.initial_fixation + this.learn_time+this.fixation_time_1+this.test_time;
        console.log("times: ","fixation: ",this.initial_fixation," learn: ",this.learn_time," total: ",this.total_loop_time);

    }

    loopHead(){

        this.current_difficulty = this.staircase.getCurrentVal();

        this.trial_correct =Math.random() >= 0.5; 

        this.stimpair = this.stim_class.getPairForTrial(this.current_difficulty,this.psychojs.window,this.trial_correct);

        this.setupTimes();

        this.keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});

        this.clock.reset();

        this.all_pressed_keys = [];

        return Scheduler.Event.NEXT;
    }


    loopBodyEachFrame(){

    let time_adjusted_with_frame = 0;

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
       
      console.log("keyboard activated..");
      this.keyboard.tStart = t;  // (not accounting for frame time here)
      this.keyboard.frameNStart = this.frameN;  // exact frame index
      
        // we do this at window flip for better timing!!
      this.psychojs.window.callOnFlip(function(clock) { clock.reset(); },this.keyboard.clock);  // t=0 on next screen flip
      this.psychojs.window.callOnFlip(function(keyboard) { keyboard.start(); },this.keyboard); // start on screen flip
      this.psychojs.window.callOnFlip(function(keyboard) { keyboard.clearEvents(); },this.keyboard);
    }

    time_adjusted_with_frame = this.t_test_end - this.psychojs.window.monitorFramePeriod * 0.75;  // most of one frame period left
    if (this.keyboard.status === PsychoJS.Status.STARTED && t >= time_adjusted_with_frame) {
      this.keyboard.stop();
    }

    if (this.keyboard.status === PsychoJS.Status.STARTED) {
      let theseKeys = this.keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
      this.all_pressed_keys = this.all_pressed_keys.concat(theseKeys);
    }




        if (t > this.total_loop_time){

        console.log("next loop..");
            continueRoutine = false;
        }

            if (this.psychojs.experiment.experimentEnded || this.psychojs.eventManager.getKeys({keyList:['escape']}).length > 0) {
            this.psychojs.window.close();
              this.psychojs.quit({message: "Die [Escape] Taste wurde gedrückt. Das Experiment wurde abgebrochen. Danke für Ihre Teilnahme.", isCompleted: true});
              return Scheduler.Event.QUIT;

            }


    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {

        console.log("next loop..");
      return Scheduler.Event.NEXT;
    }
}

    loopEnd(){
        // and now the loop has ended
        this.stimpair.learn.setAutoDraw(false);
        this.stimpair.test.setAutoDraw(false);

        let trial_was_correct = false;
        // get data:
        // TODO!!
        this.psychojs.experiment.addData("len",this.stimpair.learn.getDifficulty());

        console.log("data: ",this.all_pressed_keys);
        // check if it was correct or not.
        for( let i= 0; i< this.all_pressed_keys.length ; i++){

            let pressed_key = this.all_pressed_keys[i];

              console.log("keyboard keys: ",pressed_key.name);

            if( this.valid_keys.includes(pressed_key.name)){
                if ((pressed_key.name == this.correct_key && this.trial_correct == true) 
                    || (pressed_key.name != this.correct_key && this.trial_correct == false)){
                    // correct response
                    this.psychojs.experiment.addData("correct","true");
                    this.psychojs.experiment.addData("rt",pressed_key.rt);
                    trial_was_correct = true;
                    break;

                }
                else{
                    // incorrect response
                    this.psychojs.experiment.addData("correct","false");
                    this.psychojs.experiment.addData("rt",pressed_key.rt);
                     break;

                }

            }

        }
        

        this.psychojs.experiment.nextEntry();

        this.current_difficulty = this.staircase.getNewVal(trial_was_correct);

        return Scheduler.Event.NEXT;

    }

    saveData(){
        // TODO check how we will do this!!.
        // this.psychojs.experiment.save();
        console.log("experiment: ",this.psychojs.experiment);
    }


    }


export {StaircaseScheduler};
