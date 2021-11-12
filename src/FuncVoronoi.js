import React, { useRef, useEffect } from "react";
import Voronoi3 from "./voronoi3";

export default props => {
    const { viewport, data, hoteldata, func } = props;
    let processedData = func(data,hoteldata)
    return (<Voronoi3  viewport={viewport} data={processedData}/>)
}