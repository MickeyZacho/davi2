

import { kdTree } from "kd-tree-javascript"
import { FormControl, FormControlLabel, FormLabel, Checkbox, Slider, FormGroup, TextField } from '@mui/material';
import * as React from 'react';

export class BiggestInRadius{
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
        //const kdt = new kdTree([], (a,b)=>Math.sqrt(Math.pow(a.lat-b.lat,2)+Math.pow(a.lng-b.lng,2)), ["lat","lng"])
        const kdt = new kdTree([], BiggestInRadius.dist, ["lat","lng"])
        let outData = []
        try{
        cityData.forEach(e => {
            let entry = {
                lng: e.position[0],
                lat: e.position[1],
                city: e.CityName,
                pop: e.population
            }
            kdt.insert(entry)
        });
        hotelData.forEach(e => {
            
            let closestCity = kdt.nearest({lng: e.position[0],lat: e.position[1]},100,50)
            let res = Math.max.apply(Math, closestCity.map(function(o){return o[0].pop}))
            let obj = closestCity.find(function(o){return o[0].pop == res})

            let entry = {
                position: [+e.position[0],+e.position[1]],
                CityName: (obj!=undefined)?obj[0].city:"No City",
                country: e.country
            }
            outData.push(entry)
        })}
        catch(e){
            console.log(e)
        }
        console.log(outData[0])
        return outData
    }
    
    static getParameters() {
        return (
            <div style={{width: 500, justifyContent:"center", alignItems:"center"}}>
                <h3>Biggest in Radius Parameters</h3>
                <TextField variant="outlined" label="Radius"/>
            </div>
        )
    }
    
}