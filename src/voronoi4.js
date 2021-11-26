import React, { useRef, useEffect } from "react";
import { Delaunay } from "d3-delaunay";
import { select } from "d3-selection";
import {BinarySearchTree} from "./SearchTree.js"
import { kdTree } from "kd-tree-javascript"
export default props => {
  const { viewport, data, opacity, colorString  } = props;

  //if (!data.map) return null;

  const width = viewport.width;
  const height = viewport.height;
  let startTime = new Date()
  //const point = data.map(d => viewport.project(d.position));
  let lines = []
  data.forEach(e => {
    //console.log(e)
    e.forEach(d => {
      //console.log(d)
      
       let projA = viewport.project(d.a)
       let projB = viewport.project(d.b)
       if(projA[0]<0 && projB[0]<0) return
       if(projA[1]<0 && projB[1]<0) return
       if(projA[0]>width && projB[0]>width) return
       if(projA[1]>height && projB[1]>height) return
       
       lines.push([projA, projB])
    
      
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
      .data(lines);

    const enter = selected
      .enter()
      .append("path")
      .attr("class", "cell")
      .attr("stroke", colorString)
      .attr("opacity", opacity);

    selected.merge(enter).attr("d", d => {
      //console.log(d)
      //if (!d || d.length < 1) return null;
      return `M${d[0]+"L"+d[1]}Z`;
    });
  };

  useEffect(() => {
    
    update.current();
  }, [lines]);

  return (
    <svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}>
      <g ref={pathGroupEl} />
    </svg>
  );
};
