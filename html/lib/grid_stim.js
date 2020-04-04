import { PsychoJS } from './core-2020.1.js';
import { Color } from './util-2020.1.js';
import { Polygon,Rect } from './visual-2020.1.js';



class  Grid {
    constructor(name, win, size,lines=5)
    {
        this.status = PsychoJS.Status.NOT_STARTED;


        this.lines = lines;
        this.size= size;
        this.win = win;
        this.rects = []
        // background
        this.rects.push(new Rect({
            win : win,
            name : 'back_ground', 
            ori : 0, pos : [0, 0], size : [size,size],
            fillColor: new Color('white'), 
            lineColor: new Color('black'), 
            lineWidth: 3,
            flipHoriz : false, flipVert : false,
        })); 


        let offset = size/2;
        let size_inc = size/lines;
        // grid

        for (let i = this.lines; i>0 ; i--){
            let this_size = size_inc*i;
            let this_offset = (offset-this_size/2)/2;

            this.rects.push(new Rect({
                win : win,
                name : 'rect'+i, 
                ori : 0, pos : [this_offset, 0], size : [this_size, size],
                lineColor: new Color('black'), 
                lineWidth: 2,
                flipHoriz : false, flipVert : false,
            }) );
            this.rects.push(new Rect({
                win : win,
                name : 'rect'+i, 
                ori : 0, pos : [0, -this_offset], size : [size, this_size],
                lineColor: new Color('black'), 
                lineWidth: 2,
                flipHoriz : false, flipVert : false,
            }) );

        }
    }

    setAutoDraw(autoDraw, log = false)
    {
        for (const rect of this.rects){
            rect.setAutoDraw(autoDraw,log);
        }
        if (autoDraw){
            this.status = PsychoJS.Status.STARTED;
        }
        else{
            this.status = PsychoJS.Status.STOPPED;
        }
    }

}

class Vs_stim extends Grid {

    constructor(name, win, size,lines=5)
    {
        super(name,win,size,lines);
        this.dot_size = ((this.size / this.lines) / 2 )*0.8;
        this.dots = []

        if (this.lines % 2)
        {
            this.middle_dot = new Polygon({
                win: win,
                name: 'black_dot',
                size: this.dot_size,
                lineColor: new Color('black'),
                fillColor: new Color('black'),
                edges: 32,
            });
        }
        // to keep track of free positions in the grid (used for random dot generation)
        this.free_pos = this.getAllPossiblePositions();

    }

    // function so we can use this like we would use any other stimulus
    setAutoDraw(autoDraw, log = false)
    {
        // takes care of setting started, stopped...
        super.setAutoDraw(autoDraw,log);

        // enable drawing for additional stuff:
        if (this.lines % 2)
        {
            this.middle_dot.setAutoDraw(autoDraw,log);
        }

        for (const dot of this.dots){
            dot.setAutoDraw(autoDraw,log);
        }
    }


    getDifficulty(){
        return this.getTakenPositions().length;
    }
    // adds a dot to the given field in the grid 
    // x=0 is left y=0 is at the bottom
    // x and y are indices not coordinates!
    addDot(x,y){

        if (x >= this.lines || y >= this.lines){
            // out of range!!
            console.log("(addDot): index out of range");
            return;
        }

        let empty_pos = this.free_pos.findIndex((element) => (element.x == x && element.y == y));
        if (empty_pos != -1)
        {
            this.free_pos.splice(empty_pos,1);
        }
        else
        {
            console.log("(addDot): spot already taken.");
            return;
        }

        let shift = this.size/4;
        let line_distance = (this.size/this.lines) /2;

        let x_pos = x*line_distance+(line_distance/2)-shift;

        let y_pos = y*line_distance+(line_distance/2)-shift;

        this.dots.push(new Polygon({
            win: this.win,
            name: 'circle',
            size: this.dot_size,
            lineColor: new Color('black'),
            fillColor: new Color('white'),
            edges: 32,
            pos: [x_pos,y_pos]
        }));
    }

    // adds one random dot to the grid
    addRandomDot(){

        // get random position from our list of free positions
        let rand_pos = this.free_pos[Math.floor(Math.random() * this.free_pos.length)];
        this.addDot(rand_pos.x, rand_pos.y);

    }

    // adds n_dots random dot to the grid
    addRandomDots(n_dots){
        for(let i= 0; i<n_dots;i++){
            this.addRandomDot();
        }
    }

    // returns all possible positions to place a dot. 
    // the middle is not included because we have the black dot there already.
    getAllPossiblePositions(){
        let poss_pos = [];
        let middle = Math.floor(this.lines / 2);
        for (let i = 0;i<this.lines;i++)
        {
            for (let j = 0;j<this.lines;j++)
            {
                // this is only relevant for grids with uneven number of lines
                if (this.lines % 2 && i == middle && j == middle)
                {
                    // dont add the middle position!
                }
                else
                {
                    poss_pos.push({x:i,y:j});
                }
            }
        }
        return poss_pos;

    }

    getTakenPositions(){

        console.log("(getTakenPositions) called");
        let taken_pos = this.getAllPossiblePositions();

       
        for (const pos of this.free_pos){

            console.log("(getTakenPositions) removing: ",pos);
            let remove_pos = taken_pos.findIndex((element) => (element.x == pos.x && element.y == pos.y));

            if (remove_pos != -1)
            {
                taken_pos.splice(remove_pos,1);
            }
            else
            { 

                for (const p of taken_pos){
    console.log("(getTakenPositions) taken_pos ",p);
                }

            console.log("(getTakenPositions) could not find: ",pos);

                throw  "(getTakenPositions) index problem somewhere..";
            }
        }

        console.log("(getTakenPositions) returning",taken_pos);



        return taken_pos;
    }

    moveRandomDot(){
        console.log("(moveRandomDot) called:");
        let taken_pos = this.getTakenPositions();
        let to_remove = taken_pos[Math.floor(Math.random() * taken_pos.length)];
        this.addRandomDot();
        this.free_pos.push(to_remove);

        let pos_to_place_dot = this.getTakenPositions();
        console.log("pos_to_place_dot:"+pos_to_place_dot);

        // remove all the dots!
        this.dots.length = 0;
        this.free_pos = this.getAllPossiblePositions();

        for (const dot_pos of pos_to_place_dot){
            this.addDot(dot_pos.x,dot_pos.y);
        }
    }

    // returns a pair of Vs_stimuli objects to use in our study.
    //
    static getPairForTrial(n_dots,win,size,correct){
        let stim_first = new Vs_stim('learn',win,size);
        stim_first.addRandomDots(n_dots);
        let stim_second = new Vs_stim('test',win,size);
        // copy elements because i dont want to write a copy ctor..
        // slice copies by value.
        stim_second.dots = stim_first.dots.slice(); 
        stim_second.free_pos = stim_first.free_pos.slice(); 

        if(correct == false){
            stim_second.moveRandomDot();
        }




        return {learn: stim_first,test:stim_second};

    }


}

export { Grid,Vs_stim };
