import { PsychoJS } from './core-2020.1.js';
import * as core from './core-2020.1.js';
import { TrialHandler } from './data-2020.1.js';
import { Scheduler } from './util-2020.1.js';
import * as util from './util-2020.1.js';
import * as visual from './visual-2020.1.js';
import * as sound from './sound-2020.1.js';
import {Ord_stim} from './ord_stim.js';
import {InstuctionsScheduler} from './instructions_sheduler.js';


class SingleScheduler extends Scheduler{
    constructor(psychojs,rig=false,correct_key='j',practice=false){
        super(psychojs);
        this.psychojs = psychojs;


        this.practice = practice;
        this.rig = rig;

        this.clock = new util.Clock();  // set loop time to 0 by getting a new clock

        this.valid_keys = ['j', 'k'];
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
        this.add(new InstuctionsScheduler(this.psychojs));

        this.add(this.initRig);

        let n_loops = (this.practice) ? SchedulerUtils.PRACTICE_LEN : this.all_stims.length;
        for(let i= 0 ; i<n_loops ; i++)
        {
            this.add(this.loopHead);
            this.add(this.loopBodyEachFrame);
            this.add(this.loopEnd);
        }
        this.add(this.saveData);
    }

    // enable RIG task.
    initRig(){

        this.rig_keys= ["s"];
        // rig keyboard should always record.
        this.rig_keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: false});
        return Scheduler.Event.NEXT;
    }

    setupTimes(){

        // set an initial period without fixation but only once
        this.initial_fixation_time = (this.initial_fixation_time == undefined) ? 4 : 0;
        
        this.fixation_time_1 = 2;
        this.present_time = 0.5;
        this.answer_time = 1.5;
        this.fixation_time_2 = 1;



        this.total_loop_time = this.initial_fixation_time + this.fixation_time_1+this.present_time +this.answer_time+this.fixation_time_2;

        this.t_present = {start: this.initial_fixation_time+this.fixation_time_1};
        this.t_present.end = this.t_present.start + this.present_time;

        this.t_answer = {start: this.t_present.end};
        this.t_answer.end = this.t_answer.start + this.answer_time;

        console.log("times: ","fixation: ",this.initial_fixation," learn: ",this.learn_time," total: ",this.total_loop_time);

    }

    loopHead(){

        this.stim = this.all_stims[this.loop_nr];


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
        if (t >= this.t_present.start && this.stim.status === PsychoJS.Status.NOT_STARTED) {
            // keep track of start time/frame for later
            this.stim.tStart = t;  // (not accounting for frame time here)
            this.stim.frameNStart = this.frameN;  // exact frame index

            this.stim.setAutoDraw(true);
        }

        time_adjusted_with_frame = this.t_present.end - this.psychojs.window.monitorFramePeriod * 0.75;  // most of one frame period left
        if (this.stim.status === PsychoJS.Status.STARTED && t >= time_adjusted_with_frame) {

            this.stim.setAutoDraw(false);
        }

        
        // KEYBOARD handling
        if (t >= this.t_present.start && this.keyboard.status === PsychoJS.Status.NOT_STARTED) {
            // keep track of start time/frame for later

            console.log("keyboard activated..");
            this.keyboard.tStart = t;  // (not accounting for frame time here)
            this.keyboard.frameNStart = this.frameN;  // exact frame index

            // we do this at window flip for better timing!!
            this.psychojs.window.callOnFlip(function(clock) { clock.reset(); },this.keyboard.clock);  // t=0 on next screen flip
            this.psychojs.window.callOnFlip(function(keyboard) { keyboard.start(); },this.keyboard); // start on screen flip
            this.psychojs.window.callOnFlip(function(keyboard) { keyboard.clearEvents(); },this.keyboard);
        }

        if (this.keyboard.status === PsychoJS.Status.STARTED && t >= this.t_answer.end) {
            console.log("keyboard deactivated..");
            this.keyboard.stop();
        }

        if (this.keyboard.status === PsychoJS.Status.STARTED) {
            let theseKeys = this.keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
            this.all_pressed_keys = this.all_pressed_keys.concat(theseKeys);
        }


        // check if we exit the loop now.
        if (t > this.total_loop_time){

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
                    this.psychojs.experiment.addData("correct","true");
                    this.psychojs.experiment.addData("rt",pressed_key.rt);

                    loopdata.correct = true;
                    loopdata.rt = pressed_key.rt;
                    trial_was_correct = true;
                    break;
                }
                else{
                    // incorrect response
                    this.psychojs.experiment.addData("correct","false");
                    this.psychojs.experiment.addData("rt",pressed_key.rt);

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
        // TODO check how we will do this!!.
        // this.psychojs.experiment.save();
        console.log("experiment: ",this.psychojs.experiment);
        // TODO upload to Server. we will probably have to do this ourselves..
        console.log("data:",this.data);

        // we can do this at the very end to get all the rig data
        let rig_keys = this.rig_keyboard.getKeys({keyList: this.rig_keys, waitRelease: false});
        console.log("rig data:",rig_keys);
    }


}


export {SingleScheduler};
