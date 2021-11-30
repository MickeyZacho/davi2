

import { kdTree } from "kd-tree-javascript"

export class PopRadius{
    static dist(d,b){
        const R = 6371
        let lat1 = d.lat * Math.PI/180
        let lat2 = b.lat * Math.PI/180
        let deltalat = (b.lat-d.lat)*Math.PI/180
        let deltalng = (b.lng-d.lng)*Math.PI/180
        const a = Math.pow(Math.sin(deltalat/2),2)+Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin(deltalng/2),2)
        const c = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
        return R*c
    }
    static Process(cityData, hotelData) {
        console.log("PopRadius")
        //const kdt = new kdTree([], (a,b)=>Math.sqrt(Math.pow(a.lat-b.lat,2)+Math.pow(a.lng-b.lng,2)), ["lat","lng"])
        if(!hotelData.forEach || !cityData.forEach) return []
        const kdt = new kdTree([], PopRadius.dist, ["lat","lng"])
        let outData = new Map()
        try{
        hotelData.forEach(e => {
            let entry = {
                lng: e.position[0],
                lat: e.position[1],
                country: e.country,
                hotelId: e.hotelId
            }
            kdt.insert(entry)
        });
        cityData.sort((a,b) => a.population<b.population ? -1 : 1)
        cityData.forEach(e => {
            let distance = 0.08*Math.sqrt(e.population)
            console.log(distance)
            let hotelList = kdt.nearest({lng: e.position[0],lat: e.position[1]},300,distance)
            console.log(hotelList)
            hotelList.forEach(query => {
                let d = query[0]
                let entry = {
                    position: [+d.lng,+d.lat],
                    CityName: e.CityName,
                    country: d.country
                }
                outData.set(d.hotelId, entry)
            })
        })}
        catch(e){
            console.log(e)
        }
        
        hotelData.forEach((d) => {
            if(outData.get(d.hotelId) === undefined)
                outData.set(d.hotelId, {
                    position: [+d.position[0], +d.position[1]],
                    CityName: "No City",
                    country: d.country
                })
        })
        console.log(outData)
        console.log(Array.from(outData.values))
        console.log(Array.from(outData.values()))
        return Array.from(outData.values())
    }
    
}