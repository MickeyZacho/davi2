import { ScatterplotLayer, TextLayer } from "deck.gl";
import React, { useEffect, useState } from "react";
export default props => {
  const { data, color, size, opacity } = props;
  
  const layers = [
    new ScatterplotLayer({
      id: "scatter-lays",
      data,
      opacity: opacity,
      stroked: true,
      filled: true,
      radiusMinPixels: size,
      radiusMaxPixels: 1000,
      lineWidthMinPixels: 1,
      pickable: true,
      getRadius: d => Math.sqrt(d.exits),
      getFillColor: color,
      getLineColor: color,
      getPosition: d => (d.position),
      onHover: info => handleHover(info)   
    }),
    
  ];
  return layers;

  function handleHover(info){
    const {x, y, object} = info
    let tooltip = document.getElementById("tooltip");
    
    if (object) {
      tooltip.style.top = `${y}px`;
      tooltip.style.left = `${x}px`;
      tooltip.innerHTML = `
        <div><b>${object.country}</b></div>
        <div>${object.CityName}</div>
      `;
    } else { 
      tooltip.innerHTML = '';
    }
  }
};