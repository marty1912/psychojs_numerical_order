import { PsychoJS } from './psychojs/core-2020.1.js';
import * as core from './psychojs/core-2020.1.js';
import { Scheduler } from './psychojs/util-2020.1.js';
import * as util from './psychojs/util-2020.1.js';
import * as visual from './psychojs/visual-2020.1.js';
import * as SchedulerUtils from './util/scheduler_utils.js';
import * as constants from './util/constants.js';
import { Color } from './psychojs/util-2020.1.js';


class StimScheduler extends Scheduler{
    constructor({psychojs,stim,duration=4,wait_for_img=false}){
        super(psychojs);
        this.psychojs = psychojs;

        this.wait_for_img=wait_for_img;
        this.stim = stim;

        this.duration= duration;

        this.setupSchedule();


    }


    // sets up the schedule of the staircase procedure
    setupSchedule(){
        // setup the schedule
        this.add(this.setup_loop);
        this.add(this.showStim);
    }
    
    setStim(stim){
        this.stim=stim;
    }

    setup_loop(){
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
            if(this.wait_for_img){
                // check if everything is loaded.
                if(!SchedulerUtils.allImagesLoaded()){
                    let text_stim = new visual.TextStim({win:this.psychojs.window,text:constants.TEXT_LOAD,color:new Color('black')});
                    this.add( new StimScheduler({psychojs:this.psychojs,stim:text_stim,duration:1,wait_for_img:true}))
                }
                

            }
            return Scheduler.Event.NEXT;
        }
    }


}


export {StimScheduler};
