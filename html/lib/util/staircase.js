class  Staircase {
    // Staircase handler class. 
    // @param startval: the starting value that the function returns
    // @param min_val: the minimum value that the staircase is allowed to go to
    // @param min_val: the maximum value that the staircase is allowed to go to
    // @param n_up: the number of correctly solved trials until the staircase adds 1 to the difficulty
    // @param n_down: the number of correctly solved trials until the staircase adds -1 to the difficulty
    constructor(startval=6,min_val=3,max_val=11,n_up=3,n_down=1)
    {
        this.current_val = startval;
        this.min_val = min_val;
        this.max_val = max_val;
        this.n_up = n_up;
        this.n_down = n_down;
        this.correct_streak = 0;
        this.incorrect_streak = 0;
        this.direction = +1;

        this.reversals = []
        this.data = []
    }
    //getCurrentVal()
    // does not change anything. just a getter function
    //@return the current value of the staircase function (current difficulty)
    getCurrentVal(){
        return this.current_val;
    }

    //setCurrentVal()
    // setter for currentval. clamps between min and max val
    // @param val: the new value
    setCurrentVal(val){
        // clamps the value between the min and max
        this.current_val = Math.max(this.min_val, Math.min(val, this.max_val));

        // so we take the max and min into account (otherwise the reversals would give a wrong mean)
        if(val != this.current_val){

            let trial_correct =(val<this.current_val)? false : true; 
            this.reversals.push({val:this.current_val,correct:trial_correct});
        }
    }
    // getNewVal(trial_correct)
    // calculates the next value of the staircase. 
    //
    // @param trial_correct: boolean. indicates if the current trial was solved correctly or not
    //
    // @return the new value of the staircase function (the new difficulty)
    getNewVal(trial_correct)
    {
        this.data.push({val:this.current_val,correct:trial_correct});

        if(this.reversals.length == 0){
            // first phase
            if(this.data.length == 1){
                // first response
                this.direction = (trial_correct) ? +1 :-1
                this.setCurrentVal(this.current_val + this.direction);
                return this.current_val
            }
            if(this.data[this.data.length-2].correct == this.data[this.data.length-1].correct){
                this.direction = (trial_correct) ? +1 :-1
                this.setCurrentVal(this.current_val + this.direction);
                return this.current_val
            }
            else
            {
                this.reversals.push({val:this.current_val,correct:trial_correct});
                this.direction = (trial_correct) ? +1 :-1
                this.setCurrentVal(this.current_val + this.direction);
                return this.current_val
            }

        }
        else
        {
            // normal case
            if (trial_correct)
            {
                this.correct_streak++;
                this.incorrect_streak = 0;
            }
            else{
                this.incorrect_streak++;
                this.correct_streak = 0;
            }
            if (this.correct_streak == this.n_up){
                this.correct_streak = 0;
                this.setCurrentVal(this.current_val + 1);
                if(this.direction == -1){
                    this.reversals.push({val:this.current_val,correct:trial_correct});
                    this.direction = +1;
                }
            }
            if (this.incorrect_streak == this.n_down){
                this.incorrect_streak = 0;
                this.setCurrentVal(this.current_val - 1);
                if(this.direction == +1){
                    this.reversals.push({val:this.current_val,correct:trial_correct});
                    this.direction = -1;
                }
            }

            return this.current_val;

        }
    }

    // getReversals()
    // @return returns all the reversals ("umkehrpunkte") in the staircase so far
    getReversals(){

        return this.reversals;

    }

}

export { Staircase};
