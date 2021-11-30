import { kdTree } from "kd-tree-javascript"
import { Button } from "@mui/material";
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
    static Process(cityData, hotelData) {
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
            let scale = 1
            //let curDistance = closestCities[0][1]*1/Math.pow(currentCity.population,scale)
            let curDistance = closestCities[0][1]/Math.pow(Math.log(currentCity.population),scale)
            
            for(let i = 1; i<closestCities.length; i++){
                let city = closestCities[i][0]
                //let dist = d[1]*1/Math.pow(city.population, scale)
                let dist = closestCities[i][1]/Math.pow(Math.log(city.population), scale)
                if(curDistance > dist){
                    currentCity = city
                    curDistance = dist
                }
            }

            let entry = {
                position: [+e.position[0],+e.position[1]],
                CityName: currentCity.city,
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

    static getParameters(setAlgo) {
        const [val, setVal] = React.useState({});

        function handleChange1(e){
            setVal((s) => ({
                ...s,
                check1: e.target.checked
            }));
        }
        function handleChange2(e){
            setVal((s) => ({
                ...s,
                check2: e.target.checked
            }));
        }

        function handleClick(e){
            e.preventDefault();
            console.log("handleClick", document.getElementById('check1').checked, document.getElementById('check2').checked)
            const c1 =document.getElementById('check1').checked;
            const c2 =document.getElementById('check2').checked
            setAlgo(
                e,
                {check1: c1,
                check2: c2}
            )
        }

        return (
            <div style={{width: 500, justifyContent:"center", alignItems:"center"}}>
                <span style={{ fontSize: 'medium',}}>Closest City Parameters</span>
                <FormGroup>
                    <FormControlLabel control={<Checkbox defaultChecked id="check1" onChange={handleChange1} sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />} label={<span style={{ fontSize: 'small' }}>{"Label"}</span>} />
                    <FormControlLabel disabled control={<Checkbox id="check2" onChange={handleChange2} sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />} label={<span style={{ fontSize: 'small' }}>{"Disabled"}</span>} />
                </FormGroup>
                <Button variant="outlined" onClick={handleClick}>Reload</Button>
            </div>
        )
    }
}

