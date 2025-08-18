class Mat4 {
    constructor(mat) {
        this.mat = mat
    }

    product(other) {
        const sideLength = 4
        const newMat = [...this.mat]
        for (var i = 0; i < sideLength*sideLength; i++) {
            const x = Math.floor(i/sideLength)
            const y = i % sideLength
            
            /*
            console.log(
                `${x*sideLength + 0} * ${0*sideLength + y} +`,
                `${x*sideLength + 1} * ${1*sideLength + y} +`,
                `${x*sideLength + 2} * ${2*sideLength + y} +`,
                `${x*sideLength + 3} * ${3*sideLength + y}`
            )
                */
            
            newMat[i] = 
                this.mat[x*sideLength + 0] * other.mat[0*sideLength + y] + 
                this.mat[x*sideLength + 1] * other.mat[1*sideLength + y] + 
                this.mat[x*sideLength + 2] * other.mat[2*sideLength + y] + 
                this.mat[x*sideLength + 3] * other.mat[3*sideLength + y]
        }
        return new Mat4(newMat)
    }
    
}

export default Mat4