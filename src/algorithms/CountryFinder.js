import { kdTree } from "kd-tree-javascript"

export class CountryFinder{
    constructor(points){
        this.kdt = new kdTree([], (a,b)=>Math.sqrt(Math.pow(a.lat-b.lat,2)+Math.pow(a.lng-b.lng,2)), ["lat","lng"])
        points.forEach(e => {
            let point = {
                lng: e.position[0],
                lat: e.position[1],
                country: e.country
            }
            this.kdt.insert(point)
        });
    }
    query(point){
        return this.kdt.nearest({lng:point[0],lat:point[1]},1)[0][0].country
    }
}