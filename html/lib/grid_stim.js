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

    constructor(name, win, size)
    {
        super(name,win,size);
        this.dots = []
        this.middle_dot = new Polygon({
            win: win,
            name: 'black_dot',
            size: size*0.08,
            lineColor: new Color('black'),
            fillColor: new Color('black'),
            edges: 32,
        });

        this.addDot(0,0);
        this.addDot(2,0);
        this.addDot(3,2);
        
    }


    setAutoDraw(autoDraw, log = false)
    {
        // takes care of setting started, stopped...
        super.setAutoDraw(autoDraw,log);

        // enable drawing for additional stuff:
        this.middle_dot.setAutoDraw(autoDraw,log);

        for (const dot of this.dots){
            dot.setAutoDraw(autoDraw,log);
        }
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

        let shift = this.size/4;
        let line_distance = (this.size/this.lines) /2;

        let x_pos = x*line_distance+(line_distance/2)-shift;
        
        let y_pos = y*line_distance+(line_distance/2)-shift;

        this.dots.push(new Polygon({
            win: this.win,
            name: 'circle',
            size: this.size*0.08,
            lineColor: new Color('black'),
            fillColor: new Color('white'),
            edges: 32,
            pos: [x_pos,y_pos]
        }));
    }

}

export { Grid,Vs_stim };
