import { PsychoJS } from './psychojs/core-2020.1.js';
import * as core from './psychojs/core-2020.1.js';
import { TrialHandler } from './psychojs/data-2020.1.js';
import { Scheduler } from './psychojs/util-2020.1.js';
import * as util from './psychojs/util-2020.1.js';
import * as visual from './psychojs/visual-2020.1.js';
import * as sound from './psychojs/sound-2020.1.js';
import {Ord_stim} from './stims/ord_stim.js';
import {InstuctionsScheduler} from './instructions_sheduler.js';
import {FixationStim} from './stims/fixation_stim.js';
import {SchedulerUtils} from './util/scheduler_utils.js';
import * as constants from './util/constants.js';

class SingleScheduler extends Scheduler{
    constructor({psychojs,prob_code,rig=false,correct_key='j',practice=false,debug=false}){
        super(psychojs);

        this.psychojs = psychojs;
        this.debug = debug;
        this.prob_code = prob_code;
        this.practice = practice;
        this.rig = rig;
        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock
        this.valid_keys = constants.KEYS_ACCEPT_DECLINE;
        this.correct_key = correct_key;

        this.all_stims = Ord_stim.getStimsForTrial(this.psychojs.window);

        this.setupSchedule();

        console.log("starting single schedule");
        console.log("all_stims :",this.all_stims);

        this.data = []
        this.loop_nr = 0;
    }


    // sets up the schedule of the staircase procedure
    setupSchedule(){
        // setup the schedule
        if (this.debug){
            this.add(this.initRig);

            let n_loops = 1;
            for(let i= 0 ; i<n_loops ; i++)
            {
                this.add(this.loopHead);
                this.add(this.loopBodyEachFrame);
                this.add(this.loopEnd);
            }
            this.add(this.saveData);

        }
        else{

            let instruction_text = SchedulerUtils.getInstructionsText(this);

            this.add(new InstuctionsScheduler({psychojs:this.psychojs,correct_key:this.correct_key,text:instruction_text}));

            this.add(this.initRig);

            let n_loops = (this.practice) ? constants.PRACTICE_LEN : this.all_stims.length;
            for(let i= 0 ; i<n_loops ; i++)
            {
                this.add(this.loopHead);
                this.add(this.loopBodyEachFrame);
                this.add(this.loopEnd);
            }
            this.add(this.saveData);
        }
    }

    // enable RIG task.
    initRig(){

        this.rig_keys= ["s"];
        // rig keyboard should always record.
        this.rig_keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: false});
        return Scheduler.Event.NEXT;
    }

    // sets up the time points for the loop where we enable/disable stimuli.
    setupTimes(){

        // set an initial period without fixation but only once

        this.fixation_time_1 = 2;
        this.present_time = 0.5;
        this.answer_time = 1.5;
        this.fixation_time_2 = 1;

        if (this.debug){
            this.fixation_time_1 = 0.1;
            this.present_time = 0.1;
            this.answer_time = 0.1;
            this.fixation_time_2 = 0.1;
        }



        this.total_loop_time =  this.fixation_time_1+this.present_time +this.answer_time+this.fixation_time_2;

        this.t_present = SchedulerUtils.getStartEndTimes(this.fixation_time_1,this.present_time);
        this.t_answer = SchedulerUtils.getStartEndTimes(this.t_present.end,this.answer_time);

        console.log("time total: ",this.total_loop_time);

    }

    // loopHead 
    // this function is run every round of the design. so its loophead - all stimuli in the right order - loopEnd - loophead...
    loopHead(){

        this.stim = this.all_stims[this.loop_nr];


        this.fixation = FixationStim.getNFixations(this.psychojs.window,4);

        this.frameN = 0;

        this.setupTimes();

        this.keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});

        this.clock.reset();

        this.all_pressed_keys = [];

        return Scheduler.Event.NEXT;
    }


    //------Loop for each frame ------
    //this loop is run for every frame during the actual task.
    loopBodyEachFrame(){

        let time_adjusted_with_frame = 0;

        let continueRoutine = true; // until we're told otherwise

        let t = this.clock.getTime();


        // stimulus handling.
        // fixation
        SchedulerUtils.activateAndDeactivateStim(t,0,this.t_present.start,this.fixation[0],this.frameN,this.psychojs);
        // ord stimulus
        SchedulerUtils.activateAndDeactivateStim(t,this.t_present.start,this.t_present.end,this.stim,this.frameN,this.psychojs);

        // fixation
        SchedulerUtils.activateAndDeactivateStim(t,this.t_present.end,this.total_loop_time,this.fixation[1],this.frameN,this.psychojs);

        //keyboard handling
        SchedulerUtils.activateAndDeactivateKeyboard(t,this.t_present.start,this.t_answer.end,this.keyboard,this.frameN,this.psychojs);

        if (this.keyboard.status === PsychoJS.Status.STARTED) {
            let theseKeys = this.keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
            this.all_pressed_keys = this.all_pressed_keys.concat(theseKeys);
        }


        // check if we exit the loop now.
        if (t > this.total_loop_time){

            continueRoutine = false;
        }

        SchedulerUtils.quitOnEscape(this.psychojs);

        this.frameN = this.frameN + 1;// number of completed frames (so 0 is the first frame)
        // refresh the screen if continuing
        if (continueRoutine) {
            return Scheduler.Event.FLIP_REPEAT;
        } else {
            console.log("next loop..");
            return Scheduler.Event.NEXT;
        }
    }

    loopEnd(){

        let loopdata = {};
        loopdata.numbers = this.stim.getNumbers();
        loopdata.ascending = this.stim.isAscending();
        loopdata.descending = this.stim.isDescending();
        loopdata.ordered = this.stim.isOrdered();
        loopdata.distance = this.stim.getDistance();
        loopdata.datetime = new Date().toLocaleString();

        loopdata.rig = this.rig;

        // and now the loop has ended
        let trial_was_correct = false;
        // get data:
        console.log("pressed keys: ",this.all_pressed_keys);
        // check if it was correct or not.
        for( let i= 0; i< this.all_pressed_keys.length ; i++){

            let pressed_key = this.all_pressed_keys[i];

            console.log("keyboard keys: ",pressed_key.name);


            // we check for the first key that is a valid key
            // so if somebody pressed "ersdrtj" we only get the rt for the "j" 
            if( this.valid_keys.includes(pressed_key.name)){
                if ((pressed_key.name == this.correct_key && this.stim.isOrdered() == true) 
                    || (pressed_key.name != this.correct_key && this.stim.isOrdered() == false)){
                    // correct response

                    loopdata.correct = true;
                    loopdata.rt = pressed_key.rt;
                    trial_was_correct = true;
                    break;
                }
                else{
                    // incorrect response

                    loopdata.correct = false;
                    loopdata.rt = pressed_key.rt;
                    break;
                }

            }

        }

        this.psychojs.experiment.nextEntry();

        // our own approach to data stuff.
        this.data.push(loopdata);

        this.loop_nr++;

        return Scheduler.Event.NEXT;

    }

    saveData(){


        if(this.rig == true){

            let trial = "dual_rig";
            SchedulerUtils.upload(this.data,trial,this.prob_code);
            let rig_keys = this.rig_keyboard.getKeys({keyList: this.rig_keys, waitRelease: false});
            trial = "rig";
            SchedulerUtils.upload(this.rig_keys,trial,this.prob_code);
            console.log("rig data:",rig_keys);
        }
        else
        {
            let trial = "single";
            SchedulerUtils.upload(this.data,trial,this.prob_code);
        }
        return Scheduler.Event.NEXT;
    }


}


export {SingleScheduler};
