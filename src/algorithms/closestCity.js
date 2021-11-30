import { kdTree } from "kd-tree-javascript"
import { Button, Input } from "@mui/material";
import { FormControl, FormControlLabel, FormLabel, Checkbox, Slider, FormGroup } from '@mui/material';
import * as React from 'react';

export class ClosestCity{
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
        const kdt = new kdTree([], ClosestCity.dist, ["lat","lng"])
        let outData = []
        try{
        cityData.forEach(e => {
            let entry = {
                lng: e.position[0],
                lat: e.position[1],
                city: e.CityName,
                population: e.population
            }
            kdt.insert(entry)
        });
        hotelData.forEach(e => {
            
            let closestCities = kdt.nearest({lng: e.position[0],lat: e.position[1]},100)
            let currentCity = closestCities[0][0]
            //let curDistance = closestCities[0][1]*1/Math.pow(currentCity.population,scale)
            let curDistance = closestCities[0][1]/Math.pow(Math.log(currentCity.population),parameters.scale)
            
            for(let i = 1; i<closestCities.length; i++){
                let city = closestCities[i][0]
                //let dist = d[1]*1/Math.pow(city.population, scale)
                let dist = closestCities[i][1]/Math.pow(Math.log(city.population), parameters.scale)
                if(curDistance > dist){
                    currentCity = city
                    curDistance = dist
                }
            }

            let entry = {
                position: [+e.position[0],+e.position[1]],
                CityName: currentCity.city,
                country: e.country,
                cityPos: [currentCity.lng, currentCity.lat]
            }
            outData.push(entry)
        })}
        catch(e){
            console.log(e)
        }
        console.log(outData[0])
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
                {scale: val}
            )
        }

        return (

                <div class="column" style={{width: 500, }}>
                <div class="row">
                <span style={{ fontSize: 'medium',}}>Closest City</span>
                </div>
                <div class="row">
                <label for="algo1input1" id="inputid">Input weight (0-100)</label>
                <div class="row">
                <Input  type="number" id="algo1input1" name="algo1input1" min="0" max= "100" placeholder="standard: 50 " onChange={handleChange}/>
                </div>
                </div>
                <div class="row">
                <Button variant="outlined" onClick={handleClick}>Reload</Button>
                </div>
            </div>
            
        )
    }
}

