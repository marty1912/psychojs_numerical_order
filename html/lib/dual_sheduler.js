import { PsychoJS } from './core-2020.1.js';
import * as core from './core-2020.1.js';
import { TrialHandler } from './data-2020.1.js';
import { Scheduler } from './util-2020.1.js';
import * as util from './util-2020.1.js';
import * as visual from './visual-2020.1.js';
import * as sound from './sound-2020.1.js';
import {Ord_stim} from './ord_stim.js';
import {Phon_stim} from './phon_stim.js';
import {Vs_stim} from './grid_stim.js';
import {InstuctionsScheduler} from './instructions_sheduler.js';
import {SchedulerUtils} from './scheduler_utils.js';
import {FixationStim} from './fixation_stim.js';


class DualScheduler extends Scheduler{

    constructor({psychojs,mode="vis",correct_key='j',dual_difficulty=7,practice=false,staircase_sched}){
        super(psychojs);
        this.psychojs = psychojs;

        this.practice = practice;
        this.mode = mode;

        if (mode == "phon")
        {
            this.dual_stim_class = Phon_stim;
        }
        else if(mode == "vis")
        {

            this.dual_stim_class = Vs_stim ;
        }
        else
        {
            throw "invalid mode!"
        }


        this.dual_difficulty = staircase_sched.getDifficulty();


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


        let n_loops = (this.practice) ? SchedulerUtils.PRACTICE_LEN : this.all_stims.length;
        for(let i= 0 ; i<n_loops ; i++)
        {
            this.add(this.loopHead);
            this.add(this.loopBodyEachFrame);
            this.add(this.loopEnd);
        }
        this.add(this.saveData);
    }

    setupTimes(){

        this.dual_task_pres_time = 0.4*this.dual_difficulty;
        this.fixation_time_1 = 2;
        this.present_time = 0.5;
        this.answer_time = 1.5;
        this.dual_answer_time = 2;
        this.fixation_time_2 = 1;




        this.t_dual_pres = SchedulerUtils.getStartEndTimes(0,this.dual_task_pres_time);

        this.t_present =  SchedulerUtils.getStartEndTimes(this.t_dual_pres.end+this.fixation_time_1,this.present_time);

        this.t_answer = SchedulerUtils.getStartEndTimes(this.t_present.end,this.answer_time);

        this.t_dual_answer = SchedulerUtils.getStartEndTimes(this.t_answer.end,this.dual_answer_time);


        this.total_loop_time = this.dual_task_pres_time +this.fixation_time_1+this.present_time +this.answer_time + this.dual_answer_time + this.fixation_time_2;


        console.log("time total: ",this.total_loop_time);

    }

    loopHead(){

        this.stim = this.all_stims[this.loop_nr];


        this.fixation = FixationStim.getNFixations(this.psychojs.window,4);
        // random boolean
        this.dual_task_correct = Math.random() >= 0.5; 
        this.dual_stims = this.dual_stim_class.getPairForTrial(this.dual_difficulty,this.psychojs.window,this.dual_task_correct);

        this.frameN = 0;

        this.setupTimes();

        this.keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});

        this.dual_keyboard = new core.Keyboard({psychoJS: this.psychojs, clock: new util.Clock(), waitForStart: true});


        this.clock.reset();

        this.all_pressed_keys = [];

        this.dual_all_pressed_keys = [];

        return Scheduler.Event.NEXT;
    }


    //------Loop for each frame ------
    //this loop is run for every frame during the actual task.
    loopBodyEachFrame(){

        let time_adjusted_with_frame = 0;

        let continueRoutine = true; // until we're told otherwise

        let t = this.clock.getTime();



        // Activate and deactivate stuff. 
        // fixation
        SchedulerUtils.activateAndDeactivateStim(t,0,this.t_dual_pres.start,this.fixation[0],this.frameN,this.psychojs);
        // dual task
        SchedulerUtils.activateAndDeactivateStim(t,this.t_dual_pres.start,this.t_dual_pres.end,this.dual_stims.learn,this.frameN,this.psychojs);
        // fixation
        SchedulerUtils.activateAndDeactivateStim(t,this.t_dual_pres.end,this.t_present.start,this.fixation[1],this.frameN,this.psychojs);
        // order task:
        SchedulerUtils.activateAndDeactivateStim(t,this.t_present.start,this.t_present.end,this.stim,this.frameN,this.psychojs);
        SchedulerUtils.activateAndDeactivateKeyboard(t,this.t_present.start,this.t_answer.end,this.keyboard,this.frameN,this.psychojs);
        // fixation
        SchedulerUtils.activateAndDeactivateStim(t,this.t_present.end,this.t_answer.end,this.fixation[2],this.frameN,this.psychojs);
        // dual task 2nd time:
        SchedulerUtils.activateAndDeactivateStim(t,this.t_dual_answer.start,this.t_dual_answer.end,this.dual_stims.test,this.frameN,this.psychojs);
        SchedulerUtils.activateAndDeactivateKeyboard(t,this.t_dual_answer.start,this.t_dual_answer.end,this.dual_keyboard,this.frameN,this.psychojs);
        SchedulerUtils.activateAndDeactivateStim(t,this.t_dual_answer.end,this.total_loop_time,this.fixation[3],this.frameN,this.psychojs);




        // log key presses:
        // TODO check if we have to do this.
        if (this.keyboard.status === PsychoJS.Status.STARTED) {
            let theseKeys = this.keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
            this.all_pressed_keys = this.all_pressed_keys.concat(theseKeys);
        }


        if (this.dual_keyboard.status === PsychoJS.Status.STARTED) {
            let theseKeys = this.dual_keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
            this.dual_all_pressed_keys = this.dual_all_pressed_keys.concat(theseKeys);
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
        // and now the loop has ended

        let loopdata = {};
        loopdata.numbers = this.stim.getNumbers();
        loopdata.ascending = this.stim.isAscending();
        loopdata.descending = this.stim.isDescending();
        loopdata.ordered = this.stim.isOrdered();
        loopdata.distance = this.stim.getDistance();


        let response_ord = this.checkCorrectKey(this.all_pressed_keys);
        if(response_ord != undefined){
            loopdata.correct_ord = response_ord.correct; 
            loopdata.rt_ord = response_ord.rt;
        }

        let response_dual = this.checkCorrectKey(this.dual_all_pressed_keys);
        if(response_dual != undefined){
            loopdata.correct_dual = response_dual.correct;
            loopdata.rt_dual = response_dual.rt;
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

    }

    checkCorrectKey(all_pressed_keys){
        let trial_was_correct = false;
        // get data:
        console.log("pressed keys: ",all_pressed_keys);
        // check if it was correct or not.
        for( let i= 0; i< all_pressed_keys.length ; i++){

            let pressed_key = all_pressed_keys[i];

            console.log("keyboard keys: ",pressed_key.name);


            // we check for the first key that is a valid key
            // so if somebody pressed "ersdrtj" we only get the rt for the "j" 
            if( this.valid_keys.includes(pressed_key.name)){
                if ((pressed_key.name == this.correct_key && this.stim.isOrdered() == true) 
                    || (pressed_key.name != this.correct_key && this.stim.isOrdered() == false)){
                    // correct response

                    return {correct: true,rt:pressed_key.rt};
                }
                else{
                    // incorrect response

                    return {correct: false,rt:pressed_key.rt};
                }

            }

        }

    }

}


export {DualScheduler};
