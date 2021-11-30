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
      tooltip.style.visibility = "visible"
      tooltip.style.top = `${y + 5}px`;
      tooltip.style.left = `${x + 5}px`;
      let avgHotelDistance = 0;
      if(object.avgHotelDist != null) avgHotelDistance = object.avgHotelDist;
      tooltip.innerHTML = `
        <div><b>${object.country}</b></div>
        <div>${object.CityName}</div>
        ${isCity(object) ? `<div>Average hotel distance: ${avgHotelDistance}</div>` : "<div>Hotel</div>"}
      `;
    } else { 
      tooltip.style.visibility = "hidden"
      tooltip.innerHTML = '';
    }
  }
  function isCity(object){
    return true;
  }
};