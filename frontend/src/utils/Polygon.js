class Polygon {
    constructor(v1,v2,v3) {
        this.v1 = v1
        this.v2 = v2
        this.v3 = v3
    }
    subdivide() {
        const _v1half = this.v1.lerpn(this.v2, 0.5)
		const _v2half = this.v2.lerpn(this.v3, 0.5)
		const _v3half = this.v3.lerpn(this.v1, 0.5)

		const _pol1 = new Polygon(this.v1, _v1half, _v3half)
		const _pol2 = new Polygon(this.v2, _v2half, _v1half)
		const _pol3 = new Polygon(this.v3, _v3half, _v2half)

		this.v1 = _v1half
		this.v2 = _v2half
		this.v3 = _v3half
        
		return [_pol1, _pol2, _pol3, this]
    }
}

export default Polygon