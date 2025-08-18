import Vector3 from "./Vector3"

class Polygon {
    constructor(v1,v2,v3) {
        this.v1 = v1
        this.v2 = v2
        this.v3 = v3
		this.uv1 = { x:0, y:1 }
		this.uv2 = { x:0, y:0 }
		this.uv3 = { x:1, y:0 }
		this.normal = new Vector3(1,0,0)
		this.tangent = new Vector3(0,1,0)
		this.calculateNormal()
    }
	calculateNormal() {
		const edge_1 = this.v2.sub(this.v1)
		const edge_2 = this.v3.sub(this.v1)
		this.normal = edge_2.cross(edge_1).normalize()
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

	getVertexData() {
		const data = new Float32Array([
			this.v1.x, this.v1.y, this.v1.z,
			this.v2.x, this.v2.y, this.v2.z,
			this.v3.x, this.v3.y, this.v3.z,
			//-0.5, -0.5, 0,
        	//0.5, -0.5, 0,
        	//0.0,  0.5, 0
		])
		return data
	}
}

export default Polygon