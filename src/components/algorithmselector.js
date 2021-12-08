import React, { useEffect, useState } from "react";
import { AlgorithmsEnum } from "../Util/Algorithms.js";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";

export default (props) => {
  const { buttonColor, title, changeValue, startValue } = props;
  const [selectedValue, setSelectedValue] = React.useState(startValue);
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    changeValue(event, event.target.value);
  };

  const controlProps = (item) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    name: "size-radio-button-demo",
    inputProps: { "aria-label": item },
  });
  const Buttons = () => {
    let tempArray = [];
    for (let item in AlgorithmsEnum) {
      tempArray.push(
        <FormControlLabel
          value={AlgorithmsEnum[item]}
          control={
            <Radio
              {...controlProps(AlgorithmsEnum[item])}
              sx={{
                color: `rgb(${buttonColor[0]}, ${buttonColor[1]}, ${buttonColor[2]})`,
                "&.Mui-checked": {
                  color: `rgb(${buttonColor[0]}, ${buttonColor[1]}, ${buttonColor[2]})`,
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 14,
                },
              }}
            />
          }
          
          label={<span style={{ fontSize: 'small' }}>{AlgorithmsEnum[item]}</span>}
        />
      );
    }
    return tempArray;
  };
  return (
      <FormControl component="fieldset" sx={{
          margin: 2,
      }}>
        <FormLabel component="legend">{<span style={{ fontSize: 'small' }}>{title}</span>}</FormLabel>
        <Buttons />
      </FormControl>
  );
};
