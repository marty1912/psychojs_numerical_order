import { PsychoJS } from './psychojs/core-2020.1.js';
import * as core from './psychojs/core-2020.1.js';
import { Scheduler } from './psychojs/util-2020.1.js';
import * as util from './psychojs/util-2020.1.js';
import * as visual from './psychojs/visual-2020.1.js';
import * as SchedulerUtils from './util/scheduler_utils.js';


class StimScheduler extends Scheduler{
    constructor({psychojs,stim,duration=4,init=false}){
        super(psychojs);
        this.psychojs = psychojs;

        this.stim = stim;

        this.duration= duration;

        this.setupSchedule();


    }


    // sets up the schedule of the staircase procedure
    setupSchedule(){
        // setup the schedule
        this.add(this.init);
        this.add(this.showStim);
    }
    
    setStim(stim){
        this.stim=stim;
    }

    init(){
        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock
        console.log("StimSched: stim is:",this.stim);
        return Scheduler.Event.NEXT;
    }

    
    showStim(){

        let continueRoutine = true;
        let t = this.clock.getTime();

        // check if we exit the loop now.
        if (t > this.duration){

            continueRoutine = false;
        }

        this.stim.setAutoDraw(true);
        //SchedulerUtils.activateAndDeactivateStim(t,0,this.duration,this.stim,this.frameN,this.psychojs);

        SchedulerUtils.quitOnEscape(this.psychojs); 


        this.frameN = this.frameN + 1;// number of completed frames (so 0 is the first frame)
        // refresh the screen if continuing
        if (continueRoutine) {
            return Scheduler.Event.FLIP_REPEAT;
        } else {

        this.stim.setAutoDraw(false);
            if(this.init){
                // check if everything is loaded.
                

            }
            return Scheduler.Event.NEXT;
        }
    }


}


export {StimScheduler};
