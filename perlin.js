class NoiseGenerator{
    constructor(dimensions, interpolation){
        //Save dimensions since they'll be used often
        this.dimensions = dimensions;
        //If an interpolation function was given, verify it is valid or use smoothstep interp
        if(interpolation && interpolation(0, 1, 0) == 0 && interpolation(0, 1, 1) == 1)
            this.interp = interpolation;
        else
            this.interp = (a, b, c) => {
                c = smoothstep2(c);
                return a*(1-c)+b*c;
            }

        //Populate the vector grid to be used for dot products.
        this.vectorGrid = this.createVectorGrid(dimensions.slice(0));
    }

    createVectorGrid(dimensions){
        let length = dimensions.reduce((product, val) => product*val, 1);
        let vectors = new Array(length).fill().map(() => this.normalizedVector(dimensions.length));
        //Reverse the array of dimensions, because I want to deal with last dimension first all the way back to the first dimension
        return dimensions.reverse()
        //For every dimension length chonk up my current array into new arrays of length dimension Length
        .reduce((accumulator, dimensionLength) => {
            //Iterate through the array and chonk as necessary, checking to see if I'm at a valid chonk index. Otherwise do nothing
            return accumulator.reduce((chonks, _, currentIndex) => {
                return (currentIndex % dimensionLength == 0)? chonks.concat([accumulator.slice(currentIndex, currentIndex+dimensionLength)]): chonks
            }, [])
        }, vectors)
        .flat();
        //Chonk complete.
    }

    createVectorGrid2(dimensions){
        let length = dimensions.reduce((product, val) => product*val, 1);
        let vectors = new Array(length).fill().map(() => this.normalizedVector(dimensions.length));
        for(let i = dimensions.length-1; i >= 0; i--){
            let temp = [];
            while(vectors.length > 0){
                temp.push(vectors.splice(0, dimensions[i]));
            }
            vectors = temp;
        }
        return vectors[0];
    }

    createVectorGrid3(dimensions){
        //Return either an array of random numbers or array of arrays (eventaully base casing on random numbers).
        return new Array(dimensions[0]).fill().map(() => (dimensions.length > 1)? this.createVectorGrid(dimensions.slice(1)): this.normalizedVector(this.dimensions.length));
    }

    //Create a normalized vector of a specified length, a random vector is generated and normalized by dividing every value by the vector's magnitude.
    normalizedVector(length){
        let vec = new Array(length).fill().map(() => Math.random()*2-1);
        const magnitude = mag(vec);
        vec = vec.map(val => (magnitude != 0)? val/=magnitude: val);
        return vec;
    }

    noise(pos){
        //Verify Pos is a valid length
        pos.splice(this.dimensions.length);
        while(pos.length < this.dimensions.length)
            pos.push(0);

        //Verify pos is within valid range
        pos = pos.map((val, ind) => val%=this.dimensions[ind]);
        //Create an array of every corner around the point
        let corners = combineArrays(pos.map((val, ind) => Math.floor(val)%this.dimensions[ind]), pos.map((val, ind) => Math.ceil(val)%this.dimensions[ind]));
        //Generate the distances from the point to each of its corners (relative to the corner)
        let distances = corners.map(corner => pos.map((val, ind) => val-corner[ind]));
        //Turn every corner array (A list of coordinates) in to a vector (access this.vectorGrid at index corners[n])
        let dotProducts = corners.map(corner => valAt(this.vectorGrid, corner))
        //Generate a dot product between every corner's vector and the distance from that corner
        .map((vector, index) => dotProduct(vector, distances[index]));
        
        //Prepare an array to be reduced 
        let noise = dotProducts;
        let length = this.dimensions.length-1;

        //Due to the method that creates the array of corners they vary such that the last index changes every other value, then every two the second to last, every 4 the fourth to last, up to whatever number of dimensions there are.
        while(noise.length > 1){
            noise = noise.reduce((acc, _, ind, arr) => {
                if(ind%2 == 0){
                    //We use distances[0][length] because this corresponds to the distance (or weight) between the two 
                    return acc.concat(this.interp(arr[ind], arr[ind+1], distances[0][length]));
                } else 
                    return acc;
            }, [])
            length--;
        }
        //Return the final interpolation forced between -1 and 1.
        return constrain(noise[0], -1, 1);
    }
}

//vec1 and vec2 must be same length
//returns every combination of vec1 and vec2 such that no value changes index
//this is really only used so far to return every corner of an n dimensional "cube" given the "top left" and "bottom right" corners.
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

//Smoothstep that will always return beteween 0 and 1
function smoothstep(x){
    x = constrain(x, 0, 1);
    return x*x*(3-2*x);
}

//Smoothstep function that assumed a safe value is passed (saves small amount of processing power)
function smoothstep2(x){
    return x*x*(3-2*x);
}

//Force value betweeo min and max
function constrain(num, min, max){
    return Math.min(...[max, Math.max(...[min, num])]);
}

//Return dot product of two arbiratary length vectors of same length
function dotProduct(vec1, vec2){
    return new Array(vec1.length).fill().map((_, ind) => vec1[ind]*vec2[ind]).reduce((acc, val) => acc + val, 0);
}

//Transform a number from one range to another range
function map(num, oldMin, oldMax, min, max){
    return (num-oldMin)/(oldMax-oldMin)*(max-min)+min;
}

function valAt(arr, indices){
    return eval(indices.reduce((acc, val) => acc+`[${val}]`, "arr"));
}

function mag(vec){
    return Math.sqrt(vec.map(val => val*val).reduce((acc, val) => acc+val, 0));
}