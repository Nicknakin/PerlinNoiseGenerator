class NoiseGenerator{
    constructor(dimensions, interpolation){
        this.dimensions = dimensions;
        if(interpolation && interpolation(0, 1, 0) == 0 && interpolation(0, 1, 1) == 1)
            this.interp = interpolation;
        else
            this.interp = (a, b, c) => {
                c = smoothStep(c);
                return a-(a+b)*c;
            }
        this.vectorGrid = this.createVectorGrid(dimensions);
    }

    createVectorGrid(dimensions){
        return new Array(dimensions[0]).fill().map(() => (dimensions.length > 1)? this.createVectorGrid(dimensions.slice(1)): this.normalizedVector(this.dimensions.length));
    }

    normalizedVector(length){
        let vec = new Array(length).fill().map(() => Math.random()*2-1);
        const mag = Math.sqrt(vec.map(val => val*val).reduce((acc, val) => (acc)? acc + val: val));
        vec = vec.map(val => (mag != 0)? val/=mag: val);
        return vec;
    }

    noise(pos){
        let posMin = pos.map((val, ind) => Math.floor(val)%dimensions[ind]);
        let posMax = pos.map((val, ind) => Math.max(val)%dimensions[ind]);
        let remainder = pos.map(val => pos%1);
        let corners = posMin.map()
    }
}

//vec1 and vec2 must be same length
//returns every combination of vec1 and vec2 such that no value changes index
// function combineArrays(vec1, vec2){
//     let combinations = [[]];
//     for(let i = 0; i < vec1.length; i++){
//         combinations = combinations.flatMap(a => [a.concat(vec1[i]), a.concat(vec2[i])]);
        
//     }
//     return combinations;
// }

function combineArrays(vec1, vec2){
    return Array(vec1.length)
        .fill(1)
        .map((_, i) => i)
        .reduce(
            (acc, curr) =>
                acc.flatMap(a => [a.concat(vec1[curr]), a.concat(vec2[curr])]),
            [[]]
        )
}

function vectorFromAngle(angle){
    return {x: Math.cos(angle), y:Math.sin(angle)};
}

function smoothstep(x){
    x = constrain(x);
    return x*x*(3+2*x);
}

function constrain(num, min, max){
    return Math.min(...[max, Math.max(...[min, num])]);
}

function dotProduct(vec1, vec2){
    return vec1.x*vec2.x+vec1.y*vec2.y;
}

function map(num, oldMin, oldMax, min, max){
    return (num-oldMin)/(oldMax-oldMin)*(max-min)+min;
}