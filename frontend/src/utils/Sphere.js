import Vector3 from "./Vector3"
import Polygon from "./Polygon"

class Sphere {
    constructor(depth=0, radius=1) {
        const aspect = (1+Math.sqrt(5))/2
        let base_vertices = [
            new Vector3(-1,			    aspect,		            0).normalize(radius),
            new Vector3(1,				aspect,		            0).normalize(radius),
            new Vector3(-1,			    -aspect,	            0).normalize(radius),
            new Vector3(1,				-aspect,	            0).normalize(radius),
                
            new Vector3(0,				  -1,				    aspect).normalize(radius),
            new Vector3(0,				  1,				    aspect).normalize(radius),
            new Vector3(0,				  -1,				    -aspect).normalize(radius),
            new Vector3(0,				  1,				    -aspect).normalize(radius),
                
            new Vector3(aspect,		    0,			            -1).normalize(radius),
            new Vector3(aspect,		    0,			            1).normalize(radius),
            new Vector3(-aspect,		0,                      -1).normalize(radius),
            new Vector3(-aspect,		0,			            1).normalize(radius)
        ]
        
        //let sphere_i = [5,  1,  7,  10, 11, 9,  4,  2,  6,  8,  4,  2,  6,  8,  9,  5,  11, 10, 7,  1]
        //let sphere_j = [11, 5,  1,  7,  10, 5,  11, 10, 7,  1,  9,  4,  2,  6,  8,  9,  4,  2,  6,  8]
        //let sphere_k = [0,  0,  0,  0,  0,  1,  5,  11, 10, 7,  3,  3,  3,  3,  3,  4,  2,  6,  8,  9]
        let sphere_polygons = [
            new Polygon(base_vertices[5],base_vertices[11],base_vertices[0]),
            new Polygon(base_vertices[1],base_vertices[5],base_vertices[0]),
            new Polygon(base_vertices[7],base_vertices[1],base_vertices[0]),
            new Polygon(base_vertices[10],base_vertices[7],base_vertices[0]),
            new Polygon(base_vertices[11],base_vertices[10],base_vertices[0]),
            new Polygon(base_vertices[9],base_vertices[5],base_vertices[1]),
            new Polygon(base_vertices[4],base_vertices[11],base_vertices[5]),
            new Polygon(base_vertices[2],base_vertices[10],base_vertices[11]),
            new Polygon(base_vertices[6],base_vertices[7],base_vertices[10]),
            new Polygon(base_vertices[8],base_vertices[1],base_vertices[7]),
            new Polygon(base_vertices[4],base_vertices[9],base_vertices[3]),
            new Polygon(base_vertices[2],base_vertices[4],base_vertices[3]),
            new Polygon(base_vertices[6],base_vertices[2],base_vertices[3]),
            new Polygon(base_vertices[8],base_vertices[6],base_vertices[3]),
            new Polygon(base_vertices[9],base_vertices[8],base_vertices[3]),
            new Polygon(base_vertices[5],base_vertices[9],base_vertices[4]),
            new Polygon(base_vertices[11],base_vertices[4],base_vertices[2]),
            new Polygon(base_vertices[10],base_vertices[2],base_vertices[6]),
            new Polygon(base_vertices[7],base_vertices[6],base_vertices[8]),
            new Polygon(base_vertices[1],base_vertices[8],base_vertices[9])
        ]
        //console.log(sphere_polygons)
        for (var i = 0; i < depth; i++) {
            var _temp = []
            sphere_polygons.forEach((pol) => {
                _temp = _temp.concat(pol.subdivide())
            })
            sphere_polygons = _temp
        }
        //console.log(sphere_polygons)
        let vertex_map = new Map();
        let vertices = []
        let sphere_i = []
        let sphere_j = []
        let sphere_k = []
        sphere_polygons.forEach((polygon) => {
            const v1_key = `${polygon.v1.x} ${polygon.v1.y} ${polygon.v1.z}`
            const v2_key = `${polygon.v2.x} ${polygon.v2.y} ${polygon.v2.z}`
            const v3_key = `${polygon.v3.x} ${polygon.v3.y} ${polygon.v3.z}`
            if (!vertex_map.has(v1_key)) {
                vertices.push(polygon.v1)
                vertex_map.set(v1_key, vertices.length - 1)
            }
            
            if (!vertex_map.has(v2_key)) {
                vertices.push(polygon.v2)
                vertex_map.set(v2_key, vertices.length - 1)
            }
            
            if (!vertex_map.has(v3_key)) {
                vertices.push(polygon.v3)
                vertex_map.set(v3_key, vertices.length - 1)
            }
            sphere_i.push(vertex_map.get(v1_key))
            sphere_j.push(vertex_map.get(v2_key))
            sphere_k.push(vertex_map.get(v3_key))
        })
        this.sphere_vertices = vertices
        this.sphere_polygons = sphere_polygons
        this.sphere_i = sphere_i
        this.sphere_j = sphere_j
        this.sphere_k = sphere_k
    }
}

export default Sphere