import { PsychoJS } from './psychojs/core-2020.1.js';
import * as core from './psychojs/core-2020.1.js';
import { TrialHandler } from './psychojs/data-2020.1.js';
import { Scheduler } from './psychojs/util-2020.1.js';
import * as util from './psychojs/util-2020.1.js';
import * as visual from './psychojs/visual-2020.1.js';
import {SchedulerUtils} from './util/scheduler_utils.js';
import {FixationStim} from './stims/fixation_stim.js';


class InstuctionsScheduler extends Scheduler{
    constructor({psychojs,text="TODO: get instructions here\n press j or k to continue.",correct_key='j',pause_after=4}){
        super(psychojs);
        this.psychojs = psychojs;
        this.text = text;

        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock

        this.valid_keys = [correct_key];
        // incase we want to use it for our instructions somehow..
        this.correct_key = correct_key;

        this.fixation_time = pause_after;

        this.setupSchedule();

        this.fixation = new FixationStim({win:this.psychojs.window});

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
            pos: [0, 0], height: 0.03,  wrapWidth: true, ori: 0,
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

                    this.clock.reset();
                    return Scheduler.Event.NEXT;
                }
            }
        }


        SchedulerUtils.quitOnEscape(this.psychojs); 

        return Scheduler.Event.FLIP_REPEAT;
    }

    showFixation(){

        let continueRoutine = true;
        let t = this.clock.getTime();


        // check if we exit the loop now.
        if (t > this.fixation_time){

            continueRoutine = false;
        }

        SchedulerUtils.activateAndDeactivateStim(t,0,this.fixation_time,this.fixation,this.frameN,this.psychojs);

        SchedulerUtils.quitOnEscape(this.psychojs); 
        

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
