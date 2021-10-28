import React, { useEffect, useState } from "react";
import DeckGL, { WebMercatorViewport } from "deck.gl";
import MapGL from "react-map-gl";
import renderLayers from "./Layers.js";
import Voronoi from "./voronoi.js";

import { csv } from "d3-fetch";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./heatmap-data.csv";

export default () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await csv(DATA_URL);
      const points = result.map(function (d) {
        return { position: [+d.lng, +d.lat] };
      });
      setData(points);
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
      bearing: 0
    })
  );

  //resize
  useEffect(() => {
    const handleResize = () => {
      setViewport((v) => {
        return {
          ...v,
          width: window.innerWidth,
          height: window.innerHeight
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
            data: data
          })}
          initialViewState={viewport}
          controller={true}
        />
        <Voronoi viewport={viewport} data={data} />
      </MapGL>
    </div>
  );
};
