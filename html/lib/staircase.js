class  Staircase {
    // Staircase handler class. 
    // @param startval: the starting value that the function returns
    // @param 
    constructor(startval=7,min_val=3,max_val=11,n_up=3,n_down=1)
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
    getCurrentVal(){
        return this.current_val;
    }

    getNewVal(trial_correct)
    {
        this.data.push({val:this.current_val,correct:trial_correct});

        if(this.reversals.length == 0){
            // first phase
            if(this.data.length == 1){
                // first response
                this.direction = (trial_correct) ? +1 :-1
                this.current_val += this.direction;
                return this.current_val
            }
            if(this.data[this.data.length-2].correct == this.data[this.data.length-1].correct){
                this.direction = (trial_correct) ? +1 :-1
                this.current_val += this.direction;
                return this.current_val
            }
            else
            {
                this.reversals.push({val:this.current_val,correct:trial_correct});
                this.direction = (trial_correct) ? +1 :-1
                this.current_val += this.direction;
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
                this.current_val++;
                if(this.direction == -1){
                this.reversals.push({val:this.current_val,correct:trial_correct});
                    this.direction = +1;
                }
            }
            if (this.incorrect_streak == this.n_down){
                this.incorrect_streak = 0;
                this.current_val--;
                if(this.direction == +1){
                this.reversals.push({val:this.current_val,correct:trial_correct});
                    this.direction = -1;
                }
            }

            return this.current_val;

        }
    }

        getReversals(){
            
            return this.reversals;

        }

    }
    
export { Staircase};
