import React, { useRef, useEffect } from "react";
import { Delaunay } from "d3-delaunay";
import { select } from "d3-selection";
import {BinarySearchTree} from "./SearchTree.js"
import { kdTree } from "kd-tree-javascript"
export default props => {
  const { viewport, data } = props;

  if (!data.map) return null;
  const width = viewport.width;
  const height = viewport.height;
  //const point = data.map(d => viewport.project(d.position));
  const point = data.map(d => viewport.project(d.position));
  
  const delau = Delaunay.from(point)
 
  const vor = delau.voronoi([0,0,width,height])
  const it = vor.cellPolygons();
  let res = it.next()
 
  const kdt = new kdTree([], (a,b)=>Math.sqrt(Math.pow(a.lat-b.lat,2)+Math.pow(a.lng-b.lng,2)), ["lat","lng"])
  //console.log(kdt)
  data.forEach(e => {
    let nPos = viewport.project(e.position)
    let entry = {
      lat: nPos[0],
      lng: nPos[1],
      location: e.country
    }
    kdt.insert(entry)
  });
  //console.log(kdt)
  const tree = new BinarySearchTree()
  let lines = []
  let count = 0
  let countb = 0
  while(!res.done){
    let averageX = res.value.reduce((acc, c) => acc+(c[0]), 0)/res.value.length
    let averageY = res.value.reduce((acc, c) => acc+(c[1]), 0)/res.value.length
    let near = kdt.nearest({lat: averageX, lng: averageY}, 1)[0][0].location
    count+=res.value.length
    for(let i = 0; i < res.value.length; i++){
      let posA = res.value[i]
      countb++
      let posB = res.value[((i+1) % res.value.length)]
      let path = {a: posA, b: posB, location: near}
      let a = posA[0]+posA[1]
      let b = posB[0]+posB[1]
      let nPath = tree.insert(a+b, path)
      if(nPath != null){
        if(nPath.location !== near)
        lines.push([nPath.a, nPath.b])
      }
    }
    res = it.next()
    //console.log(lines)
    /*res.forEach(line => {
      
    });*/
  }
  //const polygons = Array.from(vor.cellPolygons());
  //console.log(lines.length)
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
      .attr("fill", "none")
      .attr("stroke", "black");

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
