
import { Button, Input } from "@mui/material";
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
    static Process(cityData, hotelData, parameters) {
        console.log("Processing, parameters are: " + parameters.radius)
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
            
            let closestCity = kdt.nearest({lng: e.position[0],lat: e.position[1]},100,parameters.radius)
            let res = Math.max.apply(Math, closestCity.map(function(o){return o[0].pop}))
            let obj = closestCity.find(function(o){return o[0].pop == res})

            let entry = {
                position: [+e.position[0],+e.position[1]],
                CityName: (obj!=undefined)?obj[0].city:"No City",
                country: e.country,
                hotelId: e.hotelId,
                cityPos: (obj!=undefined)?[obj[0].lng, obj[0].lat]:null
            }
            outData.push(entry)
        })}
        catch(e){
            console.log(e)
        }
        console.log(outData)
        return outData
    }

    
    static getParameters(setAlgo) {
        const [val, setVal] = React.useState(0);

        function handleChange(e){
            setVal(e.target.value);
        }

        function handleClick(e){
            e.preventDefault();
            setAlgo(
                e,
                {radius: val}
            )
        }
        return (
            <div class="column">
                <div class="row" style={{padding: "2px"}}>
                <span style={{ fontSize: 'small' }}>Biggest in Radius Parameters</span>
                </div>
                <div class="row" style={{padding: "2px"}}>
                <label for="algo1input1" id="inputid">Input weight (0-500)</label>
                <div class="row" style={{padding: "2px"}}>
                <Input  type="number" id="algo1input1" name="algo1input1" min="0" max= "500" placeholder="standard: 50 " onChange={handleChange}/>
                </div>
                </div>
                <div class="row" id="reloadButton" style={{padding: "2px"}}>
                <Button variant="outlined" onClick={handleClick}>Reload</Button>
                </div>

                
            </div>
        )
    }
    
}