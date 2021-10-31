import React, { useEffect, useState } from "react";
import DeckGL, { WebMercatorViewport } from "deck.gl";
//import MapGL, {MapContext} from 'react-map-gl';
import renderLayers from "./Layers.js";
import Voronoi from "./voronoi.js";
import { apiBase } from "./api.js";
import { csv } from "d3-fetch";
import MapGL from 'react-map-gl';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./worldcities3.csv";
/*
function CustomMarker(props) {
  const context = React.useContext(MapContext);
  
  const {longitude, latitude} = props;

  const [x, y] = context.viewport.project([longitude, latitude]);

  const markerStyle = {
    position: 'absolute',
    background: '#fff',
    left: x,
    top: y
  };

  return (
    <div style={markerStyle} >
      ({longitude}, {latitude})
    </div>
  );
}
*/
export default () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await csv(DATA_URL);
      /*var citybox = {
        Topleftlat: 59.6260769571419,
        Topleftlong: -13.21956641460763,
        Bottomrightlat: 55.10115713809608,
        Bottomrightlong:12.96270706010456
      }

      const result = await apiBase.get(`API/V1/Cities?topLeft.Lat=${citybox.Topleftlat}&topLeft.Lon=${citybox.Topleftlong}&bottomRight.Lat=${citybox.Bottomrightlat}&bottomRight.Lon=${citybox.Bottomrightlong}`)
      */
      const points = result.map(function (d) {
        //console.log(d);
        return {
          CityName: d.city_ascii,
          position: [+d.lng, +d.lat],
          population: d.population,
          country: d.country
        };
      });
      const finalpoints = points.filter((point) => point.population !== "");
      /*let a  = {CityName: "aTown", Id: 1, Latitude: 56.591734, Longitude: 9.130307};
      let b  = {CityName: "bTown", Id: 2, Latitude: 56.496441, Longitude: 9.620431};
      let c  = {CityName: "cTown", Id: 3, Latitude: 55.853838, Longitude: 9.189404};
      */
      console.log("GOT HERE");
      setData(finalpoints);
      //setData([{position: [+a.Longitude, +a.Latitude]},
      //         {position: [+b.Longitude, +b.Latitude]},
      //         {position: [+c.Longitude,+c.Latitude]}]);
    };

    fetchData();
  }, []);

  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: window.innerWidth,
      height: window.innerHeight,
      longitude: -3.2943888952729092,
      latitude: 53.63605986631115,
      zoom: 6,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
    })
  );

  //resize
  useEffect(() => {
    const handleResize = () => {
      setViewport((v) => {
        return {
          ...v,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <MapGL
        {...viewport}
        mapStyle={"mapbox://styles/mapbox/light-v9"}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        preventStyleDiffing={false}
        onViewportChange={(v) => setViewport(new WebMercatorViewport(v))}
      >
        <DeckGL
          layers={renderLayers({
            data: data,
          })}
          initialViewState={viewport}
          controller={true}
        />
        <Voronoi viewport={viewport} data={data} />
      </MapGL>
    </div>
  );
}; // <CustomeMarker longitude={-122.45} latitude={37.78} />
