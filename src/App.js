import React, { useEffect, useState } from "react";
import DeckGL, { WebMercatorViewport } from "deck.gl";
import MapGL, { _useMapControl as useMapControl}  from 'react-map-gl';
import renderLayers from "./Layers.js";
import Voronoi from "./voronoi.js";
import Voronoi2 from "./voronoi2.js";
import Voronoi3 from "./voronoi3.js";
import FuncVoronoi from "./FuncVoronoi.js";
import { apiBase } from "./api.js";
import { ClosestCity } from "./algorithms/closestCity.js";
import { csv } from "d3-fetch";
import * as d3 from "d3";
import funcVoronoi from "./FuncVoronoi.js";
import { TransparencySlider } from "./components/slider.js";
import Box from '@mui/material/Box';
import { Slider } from '@mui/material';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./worldcities3.csv";
const HOTEL_URL = "./hotelsout/";
const DATA_PATH = "./CountryPop/";

function CustomMarker(props) {
  
  //const context = React.useContext(MapContext);
  
  const {longitude, latitude, cityname} = props;

  const [string, setString] = React.useState(0);

  const {context, containerRef} = useMapControl({
    onDragStart: evt => {
      // prevent the base map from panning
      evt.stopPropagation();
      
    },
    onClick: evt => {
      if (evt.type === 'click') {
        setString("farvel")
      }
    }
  });
  const [x, y] = context.viewport.project([longitude, latitude]);
  const markerStyle = {
    position: 'absolute',
    background: /*'#fff'*/'',
    left: x,
    top: y
  };
  return (
    <div ref={containerRef} style={markerStyle} >
      {string}
    </div>
  );
  }

export default () => {
  
  
  const [data, setData] = useState({});
  const [hotelData, setHotelData] = useState({})
  const [processedData, setProcData] = useState({})
  const [sliderProps, setSliderProps] = useState({
    value: 20,
    handleChange: (event, newValue)=>{
      //event.persist()
      console.log("valuechange: "+ event.target.value)
      setSliderProps({value: newValue})
      //event.preventDefault()
      console.log("value after change: "+ sliderProps.value)
    }
  })
  
  useEffect(() => {
    const fetchData = async () => {
      const countries = ["Denmark", "Sweden", "Norway", "Hong Kong", "Singapore", "Liechtenstein", "Luxembourg", "Iceland", "Turkey", "Poland", "Finland", "Netherlands", "Greece", "Germany", "United States", "United Kingdom", "Ireland", "France", "Spain", "Portugal", "Korea, South", "China", "Indonesia", "Belgium", "Italy", "Austria", "Slovakia", "Hungary", "Romania", "Moldova", "Serbia", "Bosnia And Herzegovina", "Slovenia", "Czechia", "Switzerland", "Macedonia", "Albania","Bulgaria", "Kosovo", "Croatia", "Ukraine", "Belarus", "Lithuania", "Latvia", "Estonia", "Georgia", "Japan", "Thailand", "Taiwan", "Vietnam", "Philippines", "Romania", "Malaysia", "India", "Canada", "Cambodia", "Laos"]
      let result = []
      var counter = 0;
      for (var i = 0; i < countries.length; i++){
        await d3.csv(DATA_PATH + countries[i] + ".csv").then((data) => {
          for (var j = 0; j < data.length; j++) {
            if(data[j].population < 10000) continue;
            result.push(data[j])
            counter++;
          }
        });
      };
      console.log("counter: " +  counter)
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
        //console.log(d.city)
        return {
          CityName: d.city,
          position: [+d.lng, +d.lat],
          population: d.population,
          country: d.country
        };
      });
      const finalpoints = points.filter((point) => point.population !== "");
      console.log("GOT HERE");
      setData(finalpoints);
    };
    

    const fetchData2 = async () => {
      let result = []
      var counter = 0;
      for (var i = 0; i < 291; i++){
        await d3.json(HOTEL_URL + "hotels"+i + ".json").then((data) => {
          for (var j = 0; j < data.Hotels.length; j++) {
            //if(data.Hotels[j].Latitude>100 || data.Hotels[j].Latitude<-100) continue
            result.push(data.Hotels[j])
            counter++;
          }
        });
      };
      console.log("This was also reached")
      console.log("counter: " +  counter)
      const points = result.map(function (d) {
        //console.log(d);
        //console.log(d.city)
        
        return {
          hotelId: d.id,
          position: [+d.Longitude, +d.Latitude],
          country: d.Country
        };
      });
      console.log("GOT HERE");
      setHotelData(points);
    };
    
    fetchData()
    fetchData2()
    
  }, []);

  useEffect(()=>{
    let procData = ClosestCity.Process(data, hotelData)
    setProcData(procData)
  },[data,hotelData]);

  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: window.innerWidth,
      height: window.innerHeight*0.9,
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
          height: window.innerHeight*0.9,
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
        
        <Voronoi2 viewport={viewport} data={data} opacity={sliderProps.value / 100}/>
        
        
        <DeckGL 
          layers={[renderLayers({
            data: data,
            color: [0, 0, 255],
            size: 5,
            opacity: 0.5
          }),
          renderLayers({
            data: hotelData,
            color: [255, 0, 0],
            size: 1,
            opacity: 0.5
          })]}
          
          initialViewState={viewport}
          controller={true}
          getTooltip= {({object}) => object && `${object.country} \n ${object.CityName}`}
        />
      </MapGL>
    </div>
  );
  //<Voronoi3 viewport={viewport} data={data}/>
  // <div className="bg-gray-400">
  //       <Box sx={{
  //         width: window.innerWidth*0.5,
  //         height: 25,
  //         border: '1px dashed grey',
  //       }}>
  //         <Slider value={sliderProps.value} aria-label="Default" valueLabelDisplay="auto" onChange={sliderProps.handleChange} />
  //       </Box>
  //     </div>
};  
