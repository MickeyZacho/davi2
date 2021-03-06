import { FormControl, FormControlLabel, FormLabel, Checkbox, Slider, FormGroup, TextField } from '@mui/material';
import * as React from 'react';
import { kdTree } from "kd-tree-javascript"
import { AlgorithmsEnum } from '../Util/Algorithms';
import { Input, Button } from '@mui/material';

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
    static Process(cityData, hotelData, parameters) {
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

        //cityData.sort((a,b) => a.population<b.population ? -1 : 1)
        cityData.forEach(e => {
            let distance = parameters.scale*Math.sqrt(e.population)
            let hotelList = kdt.nearest({lng: e.position[0],lat: e.position[1]},100000,distance)
            //console.log(hotelList)
            hotelList.forEach(query => {
                let d = query[0]
                let entry = {
                    position: [+d.lng,+d.lat],
                    CityName: e.CityName,
                    country: d.country,
                    hotelId: d.hotelId,
                    cityPos: e.position,
                    populationOfCity: e.population
                }
            let old = outData.get(d.hotelId)
            if(old===undefined || e.population > old.populationOfCity){
                outData.set(d.hotelId, entry)
            }
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
                    hotelId: d.hotelId,
                    country: d.country,
                    cityPos: null
                })
        })
        return Array.from(outData.values())
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
                {scale: val}
            )
        }

        return (

                <div class="column" >
                <div class="row">
                <span style={{ fontSize: 'medium',}}>BigCity Scale Pop</span>
                </div>
                <div class="row" id="reloadButton">
                <label for="algo1input1" id="inputid">Input weight (0-2)</label>
                <div class="row" id="reloadButton">
                <Input  type="number" id="algo1input1" name="algo1input1" min="0" max= "100" placeholder="0.08" onChange={handleChange}/>
                </div>
                </div>
                <div class="row" id="reloadButton">
                <Button variant="outlined" onClick={handleClick}>Reload</Button>
                </div>
            </div>
            
        )
    }
}