class NoiseGenerator{
    constructor(dimensions, interpolation){
        this.dimensions = dimensions;
        if(interpolation && interpolation(0, 1, 0) == 0 && interpolation(0, 1, 1) == 1)
            this.interp = interpolation;
        else
            this.interp = (a, b, c) => {
                c = smoothstep(c);
                return a*(1-c)+b*c;
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
        while(pos.length < this.dimensions.length)
            pos.push(0);
        pos = pos.map((val, ind) => val%=this.dimensions[ind]);
        let corners = combineArrays(pos.map((val, ind) => Math.floor(val)%this.dimensions[ind]), pos.map((val, ind) => Math.ceil(val)%this.dimensions[ind]));
        let distances = corners.map(corner => pos.map((val, ind) => val-corner[ind]));
        let dotProducts = corners.map(corner => corner.reduce((vectors, ind) => {
            return vectors = vectors[ind]
        }, this.vectorGrid))
        .map((vector, index) => dotProduct(vector, distances[index]));
        let noise = dotProducts;
        let length = this.dimensions.length-1;
        while(noise.length > 1){
            noise = noise.reduce((acc, _, ind, arr) => {
                if(ind%2 == 0){
                    return acc.concat(this.interp(arr[ind], arr[ind+1], distances[0][length]));
                } else 
                    return acc;
            }, [])
            length--;
        }
        return constrain(noise[0], -1, 1);
    }
}

//vec1 and vec2 must be same length
//returns every combination of vec1 and vec2 such that no value changes index
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
    x = constrain(x, 0, 1);
    return x*x*(3-2*x);
}

function constrain(num, min, max){
    return Math.min(...[max, Math.max(...[min, num])]);
}

function dotProduct(vec1, vec2){
    return new Array(vec1.length).fill().map((_, ind) => vec1[ind]*vec2[ind]).reduce((acc, val) => acc + val, 0);
}

function map(num, oldMin, oldMax, min, max){
    return (num-oldMin)/(oldMax-oldMin)*(max-min)+min;
}