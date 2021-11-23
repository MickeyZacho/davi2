import React, { useEffect, useState } from "react";
import App from "../App";
import { AlgorithmsEnum } from "../Util/Algorithms.js"
import { FormControl, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import Radio from '@mui/material/Radio';
import { red, blue } from '@mui/material/colors';
import Box from '@mui/material/Box';

export default props => {
    const { buttonColor, title, currentValue, disabledValue, changeValue, startValue } = props;
    const [selectedValue, setSelectedValue] = React.useState(startValue);
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
        changeValue(event, event.target.value);
    };

    const controlProps = (item) => ({
        checked: selectedValue === item,
        onChange: handleChange,
        value: item,
        name: 'color-radio-button-demo',
        inputProps: { 'aria-label': item },
    });
    const Buttons = () => {
        let tempArray = []
        for(let item in AlgorithmsEnum){
            tempArray.push(<FormControlLabel 
                value={AlgorithmsEnum[item]} 
                control={<Radio
                    {...controlProps(AlgorithmsEnum[item])}
                    sx={{
                    color: buttonColor,
                    '&.Mui-checked': {
                        color: buttonColor,
                    },
                    }}
                />} 
                disabled = {AlgorithmsEnum[item] == disabledValue}
                label = {AlgorithmsEnum[item]}
            />)
        }
        return tempArray
    }
    return (
        
        <FormControl component="fieldset">
            <FormLabel component="legend">{title}</FormLabel>
                <Buttons />
        </FormControl>
    )
}

