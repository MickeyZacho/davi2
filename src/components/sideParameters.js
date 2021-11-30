import React, { useEffect, useState } from "react";
import { AlgorithmsEnum } from "../Util/Algorithms.js";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import { FormGroup, Checkbox } from "@mui/material";
import { red, blue } from "@mui/material/colors";

export default (props) => {
  const { citySetting, hotelSetting, changeCityValue, changeHotelValue } = props;

  const handleCityChange = (event) => {
    changeCityValue(event, event.target.checked);
  };
  const handleHotelChange = (event) => {
    changeHotelValue(event, event.target.checked);
  };

  const controlCityProps = (item) => ({
    checked: item,
    onChange: handleCityChange,
    value: item,
    name: "size-radio-button-demo",
    inputProps: { "aria-label": item },
  });
  const controlHotelProps = (item) => ({
    checked: item,
    onChange: handleHotelChange,
    value: item,
    name: "size-radio-button-demo",
    inputProps: { "aria-label": item },
  });
  const Boxes = () => {
    return(<FormGroup>
        <FormControlLabel
          value={citySetting}
          control={
            <Checkbox
              {...controlCityProps(citySetting)}
              sx={{
            color: blue[800],
            '&.Mui-checked': {
              color: blue[600],
            },}}
            />
          }
          
          
          label="Cities"
        />
        <FormControlLabel
          value={hotelSetting}
          control={
            <Checkbox
              {...controlHotelProps(hotelSetting)}
              sx={{
            color: red[800],
            '&.Mui-checked': {
              color: red[600],
            },
          }}
            />
          }
          
          label="Hotels"
        />
        </FormGroup>)
  };
  return (
    <div style={{ width: 500 }}>
      <FormControl component="fieldset" sx={{
          margin: 2,
      }}>
        <FormLabel component="legend">{<span style={{ fontSize: 'small' }}>{"Settings"}</span>}</FormLabel>
        <Boxes />
      </FormControl>
    </div>
  );
};
