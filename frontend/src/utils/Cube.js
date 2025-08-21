import Vector3 from "./Vector3"
import Polygon from "./Polygon"

class Cube {
    constructor(width=1) {
        this.type = 'cube'
        this.vertices = [
            new Vector3(-width/2,   -width/2,   -width/2),
            new Vector3(width/2,    -width/2,   -width/2),
            new Vector3(width/2,    width/2,    -width/2),
            new Vector3(-width/2,   width/2,    -width/2),
            
            new Vector3(-width/2,   -width/2,   width/2),
            new Vector3(width/2,    -width/2,   width/2),
            new Vector3(width/2,    width/2,    width/2),
            new Vector3(-width/2,   width/2,    width/2),
        ]
        this.polygons = [
            //top
            new Polygon(this.vertices[0], this.vertices[1], this.vertices[2]),
            new Polygon(this.vertices[0], this.vertices[2], this.vertices[3]),

            //back
            new Polygon(this.vertices[0], this.vertices[1], this.vertices[5]),
            new Polygon(this.vertices[0], this.vertices[5], this.vertices[4]),

            //front
            new Polygon(this.vertices[7], this.vertices[6], this.vertices[2]),
            new Polygon(this.vertices[7], this.vertices[2], this.vertices[3]),

            //left
            new Polygon(this.vertices[0], this.vertices[3], this.vertices[7]),
            new Polygon(this.vertices[0], this.vertices[7], this.vertices[4]),
            
            //right
            new Polygon(this.vertices[2], this.vertices[1], this.vertices[5]),
            new Polygon(this.vertices[2], this.vertices[5], this.vertices[6]),

            //bottom
            new Polygon(this.vertices[7], this.vertices[6], this.vertices[5]),
            new Polygon(this.vertices[7], this.vertices[5], this.vertices[4]),
           
        ]
    }

    getVertexData() {
        let data = new Float32Array()
        this.polygons.forEach(polygon => {
            data = Float32Array.of(...data, ...polygon.getVertexData())
        })
		
		return data
	}

    getTextureData() {
        const uvArr = this.polygons.map((polygon, index) => {
            return index % 2 == 0 
                ? [
                    { x: 0, y:0 },
                    { x: 1, y:0 },
                    { x: 1, y:1 }
                ]
                : [
                    { x: 0, y:0 },
                    { x: 1, y:1 },
                    { x: 0, y:1 }
                ]

        })
        const normalArr = this.polygons.map((polygon) => {
            const polNormal = polygon.calculateNormal()
            return [
                polNormal,
                polNormal,
                polNormal
            ]
            
        })
        const tangentArr = this.polygons.map((polygon, index) => {
            const normal = polygon.calculateNormal()
            let tangent = (index < 2 || index > 9) 
                ? normal.cross(new Vector3(0, -1, 0))
                : normal.cross(new Vector3(0, 0, -1)).normalize()
            tangent = (index === 4 || index === 5 || index > 9) ? tangent.normalize(-1) : tangent
            return [
                tangent,
                tangent,
                tangent
            ]
        })
        let uvData = new Float32Array()
        uvArr.forEach(uvs => {
            uvData = Float32Array.of(...uvData, ...(new Float32Array(
                [
                    uvs[0].x, uvs[0].y,
                    uvs[1].x, uvs[1].y,
                    uvs[2].x, uvs[2].y
                ]
            )))
        })
        let normalData = new Float32Array()
        normalArr.forEach(normals => {
            normalData = Float32Array.of(...normalData, ...(new Float32Array(
                [
                    normals[0].x, normals[0].y, normals[0].z,
                    normals[1].x, normals[1].y, normals[1].z,
                    normals[2].x, normals[2].y, normals[2].z,
                ]
            )))
        })
        let tangentData = new Float32Array()
        tangentArr.forEach(tangents => {
            tangentData = Float32Array.of(...tangentData, ...(new Float32Array(
                [
                    tangents[0].x, tangents[0].y, tangents[0].z,
                    tangents[1].x, tangents[1].y, tangents[1].z,
                    tangents[2].x, tangents[2].y, tangents[2].z,
                ]
            )))
        })
        return [uvData, normalData, tangentData]
    }
}

export default Cube