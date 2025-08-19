import Vector3 from "./Vector3"

class Polygon {
    constructor(v1,v2,v3) {
        this.v1 = v1
        this.v2 = v2
        this.v3 = v3
		this.normal = null
		this.tangent = null
		
    }
	calculateNormal() {
		const edge_1 = this.v2.sub(this.v1)
		const edge_2 = this.v3.sub(this.v1)
		return edge_2.cross(edge_1).normalize()
	}

	calculateTangent = function(uv1, uv2, uv3) {
		var edge1 = this.v2.sub(this.v1)
		var edge2 = this.v3.sub(this.v1)
		var delta_UV1 = {x: uv2.x - uv1.x, y: uv2.y - uv1.y}
		var delta_UV2 = {x: uv3.x - uv1.x, y: uv3.y - uv1.y}

		var f = 1.0 / (delta_UV1.x * delta_UV2.y - delta_UV2.x * delta_UV1.y)
		return edge1.scalar(delta_UV2.y).sub(edge2.scalar(delta_UV1.y)).scalar(f).normalize(-1)
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