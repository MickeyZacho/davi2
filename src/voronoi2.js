import React, { useRef, useEffect } from "react";
import { Delaunay } from "d3-delaunay";
import { select } from "d3-selection";

export default props => {
  const { viewport, data } = props;

  if (!data.map) return null;
  const width = viewport.width;
  const height = viewport.height;
  //const point = data.map(d => viewport.project(d.position));
  const point = data.map(d => viewport.project(d.position));

  const delau = Delaunay.from(point)
 
  const vor = delau.voronoi([0,0,width,height])
  
  const polygons = Array.from(vor.cellPolygons());

  const pathGroupEl = useRef(null);
  const update = React.useRef();

  update.current = () => {
    select(pathGroupEl.current)
      .selectAll(".cell")
      .remove()
    const selected = select(pathGroupEl.current)
      .selectAll(".cell")
      .data(polygons);

    const enter = selected
      .enter()
      .append("path")
      .attr("class", "cell")
      .attr("fill", "none")
      .attr("stroke", "black");

    selected.merge(enter).attr("d", d => {
      //console.log(d)
      if (!d || d.length < 1) return null;
      return `M${d.join("L")}Z`;
    });
  };

  useEffect(() => {
    
    update.current();
  }, [polygons]);

  return (
    <svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}>
      <g ref={pathGroupEl} />
    </svg>
  );
};