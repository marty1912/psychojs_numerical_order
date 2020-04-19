import { PsychoJS } from './psychojs/core-2020.1.js';
import * as core from './psychojs/core-2020.1.js';
import { Scheduler } from './psychojs/util-2020.1.js';
import * as util from './psychojs/util-2020.1.js';
import * as visual from './psychojs/visual-2020.1.js';
import * as SchedulerUtils from './util/scheduler_utils.js';


class StimScheduler extends Scheduler{
    constructor({psychojs,stim,duration=4}){
        super(psychojs);
        this.psychojs = psychojs;

        this.stim = stim;

        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock

        this.duration= duration;

        this.setupSchedule();


    }


    // sets up the schedule of the staircase procedure
    setupSchedule(){
        // setup the schedule
        this.add(this.showStim);
    }
    
    
    showStim(){

        let continueRoutine = true;
        let t = this.clock.getTime();

        // check if we exit the loop now.
        if (t > this.duration){

            continueRoutine = false;
        }

        SchedulerUtils.activateAndDeactivateStim(t,0,this.duration,this.stim,this.frameN,this.psychojs);

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


export {StimScheduler};
