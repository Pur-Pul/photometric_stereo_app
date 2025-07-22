class Vector3 {
    constructor(x,y,z) {
        this.x = x
        this.y = y
        this.z = z
    }
    add(vector) {
        return new Vector3(this.x+vector.x, this.y+vector.y, this.z+vector.z)
    }
    sub(vector) {
        return new Vector3(this.x-vector.x, this.y-vector.y, this.z-vector.z)
    }
    scalar(value) {
        return new Vector3(this.x*value, this.y*value, this.z*value)
    }
    norm() {
        return Math.sqrt((this.x**2)+(this.y**2)+(this.z**2))
    }
    normalize(value=1) {
        const n = this.norm()
        if (n > 0) {
			return this.scalar(value/n)
		}
		return new Vector3(this.x, this.y, this.z)
    }
    dot(vector) {
        return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z)
    }
    lerp = function(vector, t) {
		return vector.sub(this).scalar(t).add(this)
	}
	lerpn = function(vector, t) {
		return this.lerp(vector, t).normalize(this.norm())
	}
    cross = function(vector) {
        return new Vector3(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        )
    }
    angle = function(vector) {
		const rad = Math.acos(this.dot(vector) / (this.norm() * vector.norm()))
        return rad * 180 / Math.PI
	}
    dist = (vector) => {
        return Math.sqrt((this.x - vector.x)**2, (this.y - vector.y)**2, (this.z - vector.z)**2)
    }
    clone = () => {
        return new Vector3(this.x, this.y, this.z)
    }
    compare = (vector) => {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z
    }
 }

export default Vector3