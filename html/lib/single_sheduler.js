﻿import { PsychoJS } from './psychojs/core-2020.1.js';
import * as core from './psychojs/core-2020.1.js';
import { TrialHandler } from './psychojs/data-2020.1.js';
import { Scheduler } from './psychojs/util-2020.1.js';
import * as util from './psychojs/util-2020.1.js';
import * as visual from './psychojs/visual-2020.1.js';
import * as sound from './psychojs/sound-2020.1.js';
import {Ord_stim} from './stims/ord_stim.js';
import {InstuctionsScheduler} from './instructions_sheduler.js';
import {FixationStim} from './stims/fixation_stim.js';
import {StimScheduler} from './stim_scheduler.js';
import * as SchedulerUtils from './util/scheduler_utils.js';
import * as constants from './util/constants.js';
import * as ServerUtils from './util/server_utils.js';

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

        this.fixation = FixationStim.getNFixations(this.psychojs.window,4);

        this.setupSchedule();

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

            SchedulerUtils.addInstructionsToSchedule(this);

            this.add(this.initRig);

            // added for feedback
            this.feedbacks = [];
            let n_loops = (this.practice) ? constants.PRACTICE_LEN : this.all_stims.length;
            for(let i= 0 ; i<n_loops ; i++)
            {
                this.add(this.loopHead);
                this.add(this.loopBodyEachFrame);
                this.add(this.loopEnd);
                if(this.practice){
                    this.feedbacks.push(new Scheduler(this.psychojs));
                    this.add(this.feedbacks[i]);
                }

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




        this.total_loop_time =  this.fixation_time_1+this.present_time +this.answer_time+this.fixation_time_2;

        this.t_present = SchedulerUtils.getStartEndTimes(this.fixation_time_1,this.present_time);
        this.t_answer = SchedulerUtils.getStartEndTimes(this.t_present.end,this.answer_time);

        console.log("time total: ",this.total_loop_time);

    }

    // loopHead 
    // this function is run every round of the design. so its loophead - all stimuli in the right order - loopEnd - loophead...
    loopHead(){

        this.fixation_no_flash = FixationStim.getNFixations(this.psychojs.window,1);
        this.fixation_no_flash[0].setAutoDraw(true);

        this.stim = this.all_stims[this.loop_nr];



        this.fixation[1].setAutoDraw(false);
        this.fixation = FixationStim.getNFixations(this.psychojs.window,4);
        this.fixation[0].setAutoDraw(true);

        this.fixation_no_flash[0].setAutoDraw(false);


        this.frameN = 0;

        this.setupTimes();

        this.keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});

        this.clock.reset();

        this.all_pressed_keys = [];

        this.fixation_no_flash[0].setAutoDraw(false);

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
        // do not deactivate after loop.
        SchedulerUtils.activateAndDeactivateStim(t,this.t_present.end,this.total_loop_time+1,this.fixation[1],this.frameN,this.psychojs);


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
            return Scheduler.Event.NEXT;
        }
    }

    loopEnd(){

        let loopdata = {};
        loopdata.prob_code = this.prob_code;
        loopdata.numbers = this.stim.getNumbers().join(" ");
        loopdata.ascending = this.stim.isAscending();
        loopdata.descending = this.stim.isDescending();
        loopdata.ordered = this.stim.isOrdered();
        loopdata.distance = this.stim.getDistance();


        loopdata.n_frames = this.frameN;
        loopdata.loop_duration = this.clock.getTime();
        loopdata.framerate = loopdata.n_frames/loopdata.loop_duration;

        loopdata.datetime = new Date().toLocaleString("de-AT");

        loopdata.rig = this.rig;

        // and now the loop has ended
        let trial_was_correct = false;
        // get data:
        //console.log("pressed keys: ",this.all_pressed_keys);
        // check if it was correct or not.
        for( let i= 0; i< this.all_pressed_keys.length ; i++){

            let pressed_key = this.all_pressed_keys[i];

            //console.log("keyboard keys: ",pressed_key.name);


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

        // added for feedback
        if (this.practice){

            this.fixation[1].setAutoDraw(false);
            let single_correct = loopdata.correct ? true : false;

            this.feedbacks[this.loop_nr].add(new StimScheduler({
                psychojs:this.psychojs,
                stim:SchedulerUtils.getFeedbackStim(this.psychojs.window,'single',single_correct),
                duration:2}));
        }

        this.loop_nr++;

        return Scheduler.Event.NEXT;

    }

    saveData(){

        this.fixation[1].setAutoDraw(false);

        if(this.rig == true){

            let trial = "dual_rig";
            ServerUtils.upload(this.data,trial,this.prob_code);
            let rig_keys = this.rig_keyboard.getKeys({keyList: this.rig_keys, waitRelease: false});
            console.log("rig keys:",rig_keys);
            if(this.practice){
                trial = "rig_practice";
            }else{
                trial = "rig";
            }

            let rig_keys_recode  = [];
            for(let i=0;i<rig_keys.length;i++){
                let rig_key_press = {};
                rig_key_press.name = rig_keys[i].name;
                rig_key_press.code = rig_keys[i].code;
                rig_key_press.rt = rig_keys[i].rt;
                rig_key_press.tDown = rig_keys[i].tDown;
                rig_key_press.duration = rig_keys[i].duration;

                rig_keys_recode.push(rig_key_press);
            }

            ServerUtils.upload(rig_keys_recode,trial,this.prob_code);
            console.log("rig data:",rig_keys_recode);
        }
        else
        {
            let trial = "single";
            ServerUtils.upload(this.data,trial,this.prob_code);
        }
        return Scheduler.Event.NEXT;
    }


}


export {SingleScheduler};
