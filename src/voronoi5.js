import React, { useRef, useEffect } from "react";
import { Delaunay } from "d3-delaunay";
import { select } from "d3-selection";
import {BinarySearchTree} from "./SearchTree.js"
import { kdTree } from "kd-tree-javascript"
import * as d3 from "d3";
export default props => {
  const { viewport, data, opacity, colorString  } = props;

  if (!data.forEach) return null;

  const width = viewport.width;
  const height = viewport.height;
  let startTime = new Date()
  //const point = data.map(d => viewport.project(d.position));
  let lines = []
  data.forEach((countryPolies, countryName) => {
    countryPolies.forEach(e =>{
      let poly = e.map(d => viewport.project(d))
      if((poly.filter(d => d[0]<width && d[0]>0 && d[1]<height && d[1]>0)).length >0)
        lines.push({poly: poly, country: countryName})
    })
  });

  let endTime = new Date()
  console.log("Time: " + (endTime-startTime)/1000)
  const pathGroupEl = useRef(null);
  const update = React.useRef();

  update.current = () => {
    select(pathGroupEl.current)
      .selectAll(".cell")
      .remove()
    const selected = select(pathGroupEl.current)
      .selectAll(".cell")
      .data(lines)
      

    const enter = selected
      .enter()
      .append("polygon")
      .attr("class", "cell")
      .attr("fill", "transparent")
      .attr("stroke", colorString)
      .attr("opacity", opacity)
      
      
      
      
    selected.merge(enter).attr("points", d => {
      //console.log(d)
      //if (!d || d.length < 1) return null;
      return `${d.poly.join(" ")}`;
      //return `M${d.poly.join("L")}Z`;
    })
    selected.merge(enter).attr("id", d=> {
      return d.country
    }).attr('pointer-events', 'all')
    .on("mouseover", function(e) {
      console.log("Thomas er ikke en dildo")
      select(this).attr("fill", colorString)
    })
    .on("mouseout", function(e) {
      console.log("Thomas er en dildo")
      select(this).attr("fill", "transparent")
    });
  };

  useEffect(() => {
    
    update.current();
  }, [lines]);
  return (
      <g ref={pathGroupEl} />
  );
};
