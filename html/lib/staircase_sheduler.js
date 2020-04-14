import { PsychoJS } from './core-2020.1.js';
import * as core from './core-2020.1.js';
import { TrialHandler } from './data-2020.1.js';
import { Scheduler } from './util-2020.1.js';
import * as util from './util-2020.1.js';
import * as visual from './visual-2020.1.js';
import * as sound from './sound-2020.1.js';
import {Vs_stim} from './grid_stim.js';
import {Phon_stim} from './phon_stim.js';
import {Staircase} from './staircase.js';
import {InstuctionsScheduler} from './instructions_sheduler.js';
import {SchedulerUtils} from './scheduler_utils.js';
import {FixationStim} from './fixation_stim.js';


// class to handle the schedule of our staircase procedure. used in the "main"
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

    // sets up the timepoints for the loop.
    setupTimes(){


        this.fixation_time_1 = 4;
        this.test_time = 2;
        this.fixation_time_2 = 1;

        this.learn_time = 0.4 * this.stimpair.learn.getDifficulty();

        this.total_loop_time =  this.learn_time+this.fixation_time_1+this.test_time+this.fixation_time_2;

        this.t_learn = SchedulerUtils.getStartEndTimes(0,this.learn_time);

        this.t_test = SchedulerUtils.getStartEndTimes(this.t_learn.end+this.fixation_time_1,this.test_time);

        console.log("times: ","fixation: ",this.initial_fixation," learn: ",this.learn_time," total: ",this.total_loop_time);

    }

    loopHead(){

        this.current_difficulty = this.staircase.getCurrentVal();

        this.trial_correct =Math.random() >= 0.5; 

        this.stimpair = this.stim_class.getPairForTrial(this.current_difficulty,this.psychojs.window,this.trial_correct);

        this.setupTimes();

        this.fixation = FixationStim.getNFixations(this.psychojs.window,2);
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


        // stimulus learn
        SchedulerUtils.activateAndDeactivateStim(t,this.t_learn.start,this.t_learn.end,this.stimpair.learn,this.frameN,this.psychojs);
        // fixation1
        SchedulerUtils.activateAndDeactivateStim(t,this.t_learn.end,this.t_test.start,this.fixation[0],this.frameN,this.psychojs);
        // stimulus test
        SchedulerUtils.activateAndDeactivateStim(t,this.t_test.start,this.t_test.end,this.stimpair.test,this.frameN,this.psychojs);
        // fixation
        SchedulerUtils.activateAndDeactivateStim(t,this.t_test.end,this.total_loop_time,this.fixation[1],this.frameN,this.psychojs);


        // handle keyboard.
        SchedulerUtils.activateAndDeactivateKeyboard(t,this.t_test.start,this.t_test.end,this.keyboard,this.frameN,this.psychojs);

        if (this.keyboard.status === PsychoJS.Status.STARTED) {
            let theseKeys = this.keyboard.getKeys({keyList: this.valid_keys, waitRelease: false});
            this.all_pressed_keys = this.all_pressed_keys.concat(theseKeys);
        }





        SchedulerUtils.quitOnEscape(this.psychojs);
        

        if (t > this.total_loop_time) {
            console.log("next loop..");
            return Scheduler.Event.NEXT;
        } else {

            return Scheduler.Event.FLIP_REPEAT;
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
