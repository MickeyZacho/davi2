import { kdTree } from "kd-tree-javascript"
import { FormControl, FormControlLabel, FormLabel, Checkbox, Slider, FormGroup } from '@mui/material';
import * as React from 'react';

export class ClosestCity{
    static Process(cityData, hotelData) {
        const kdt = new kdTree([], (a,b)=>Math.sqrt(Math.pow(a.lat-b.lat,2)+Math.pow(a.lng-b.lng,2)), ["lat","lng"])
        let outData = []
        try{
        cityData.forEach(e => {
            let entry = {
                lng: e.position[0],
                lat: e.position[1],
                city: e.CityName
            }
            kdt.insert(entry)
        });
        hotelData.forEach(e => {
            
            let closestCity = kdt.nearest({lng: e.position[0],lat: e.position[1]},1)[0][0].city
            let entry = {
                position: [+e.position[0],+e.position[1]],
                CityName: closestCity,
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
                <span style={{ fontSize: 'medium',}}>Closest City Parameters</span>
                <FormGroup>
                    <FormControlLabel control={<Checkbox defaultChecked sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />} label={<span style={{ fontSize: 'small' }}>{"Label"}</span>} />
                    <FormControlLabel disabled control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} />} label={<span style={{ fontSize: 'small' }}>{"Disabled"}</span>} />
                </FormGroup>
            </div>
        )
    }
}

