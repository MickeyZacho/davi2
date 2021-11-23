import React, { useEffect, useState } from "react";
import DeckGL, { WebMercatorViewport, SolidPolygonLayer, PolygonLayer } from "deck.gl";
import MapGL, { _useMapControl as useMapControl}  from 'react-map-gl';
import renderLayers from "./Layers.js";
import { CountryFinder } from "./algorithms/CountryFinder.js";
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
import { textAlign } from "@mui/system";
import { BiggestInRadius } from "./algorithms/BiggestInRadius.js";
import RadioButtons from "./components/algorithmselector.js";
import { AlgorithmsEnum } from "./Util/Algorithms.js"
import { red, blue } from '@mui/material/colors';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./worldcities3.csv";
const HOTEL_URL = "./hotelsout/";
const DATA_PATH = "./CountryPop/";

function algorithmStateSwitch(algorithm){
  switch(algorithm){
    case AlgorithmsEnum.BiggestInRadius:

      break;
    case AlgorithmsEnum.ClosestCity:

      break;
  }
}
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
  
  
  const [data, setData] = useState({value:[]});
  const [hotelData, setHotelData] = useState({value:[]})
  const [countryHotelData, setCountryHotelData] = useState({value:[]})
  const [countryCityData, setCountryCityData] = useState({value:[]})
  
  const [processedData, setProcData] = useState({})
  const [processedData2, setProcData2] = useState({})
  const [posToCountry, setPosToCountry] = useState({})
  const [curCountry, setCurCountry] = useState({})
  const [sliderProps, setSliderProps] = useState({
    value: 20,
    handleChange: (event, newValue)=>{
      setSliderProps({
        handleChange: sliderProps.handleChange,
        value: newValue,
      })
    }
  })
  const [firstAlgorithmValue, setFirstAlgorithmValue] = useState({
    value: AlgorithmsEnum.BiggestInRadius,
    handleChange: (event, newValue)=>{
      setFirstAlgorithmValue({
        handleChange: firstAlgorithmValue.handleChange,
        value: newValue,
      })
    }
  })
  const [secondAlgorithmValue, setSecondAlgorithmValue] = useState({
    value: AlgorithmsEnum.ClosestCity,
    handleChange: (event, newValue)=>{
      setSecondAlgorithmValue({
        handleChange: secondAlgorithmValue.handleChange,
        value: newValue,
      })
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
      setPosToCountry(new CountryFinder(points))
    };
    /*const fetchData3 = async () => {
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
      const points = result.map(function (d) {
        return {
          CityName: d.city,
          position: [+(+d.lng - 1), +(+d.lat - 1) ],
          population: d.population,
          country: d.country
        };
      });
      const finalpoints = points.filter((point) => point.population !== "");
      console.log("GOT HERE");
      setSecondData(finalpoints);
    };
    fetchData3()*/
    fetchData()
    fetchData2()
    
    
  }, []);

  useEffect(()=>{
    let procData = BiggestInRadius.Process(countryCityData, countryHotelData)
    let procData2 = ClosestCity.Process(countryCityData, countryHotelData)
    setProcData(procData)
    setProcData2(procData2)
  },[countryCityData,countryHotelData]);

  useEffect(()=>{
    try{
      let filteredHotels = hotelData.filter(e=>e.country === curCountry)
      let filteredCities = data.filter(e=>e.country === curCountry)
      setCountryCityData(filteredCities)
      setCountryHotelData(filteredHotels)
    }catch{}
  },[curCountry])
  const nonMapHeight = 200;
  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: window.innerWidth,
      height: window.innerHeight - nonMapHeight,
      longitude: -3.2943888952729092,
      latitude: 53.63605986631115,
      zoom: 6,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
    })
  );
  useEffect(()=>{
    try{
      //console.log(curCountry)  
    let position = [viewport.longitude, viewport.latitude]
    let country = posToCountry.query(position)
    if(country !== curCountry){
      setCurCountry(country)
    }
    }catch {}
  },[viewport])

  //resize
  useEffect(() => {
    const handleResize = () => {
      setViewport((v) => {
        return {
          ...v,
          width: window.innerWidth,
          height: window.innerHeight - nonMapHeight,
        };
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const sampleData = [
            {polygon: [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]},   // Simple polygon (array of coords)
            {polygon: [                                            // Complex polygon with one hole
              [[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]],            // (array of array of coords)
              [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
            ]}
          ]; 
  const layer = new PolygonLayer({
            id: 'polygon-layer',
            data: sampleData,
            stroked: true,
            filled: true,
            wireframe: false,
            extruded: false,
            lineWidthMinPixels: 1,
            getPolygon: d => d.polygon,
            getFillColor: [255, 0, 0, 20],
            getLineColor: [255, 0, 0],
            getLineWidth: 1,
          }) 
  
  return (
    <div style={{height: "100vh"}}>
      <MapGL
        {...viewport}
        mapStyle={"mapbox://styles/mapbox/light-v9"}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        preventStyleDiffing={false}
        onViewportChange={(v) => setViewport(new WebMercatorViewport(v))}
      >
        <svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}>
        <Voronoi3 viewport={viewport} data={processedData} opacity={sliderProps.value / 100} colorString={"blue"}/>
        <Voronoi3 viewport={viewport} data={processedData2} opacity={1-sliderProps.value / 100} colorString={"red"}/>
        </svg>
        
        <DeckGL 
          layers={[renderLayers({
            data: countryCityData,
            color: [0, 0, 255],
            size: 5,
            opacity: 0.5
          }),
          renderLayers({
            data: processedData,
            color: [255, 0, 0],
            size: 2,
            opacity: 0.5
          }),
          layer]}
          
          initialViewState={viewport}
          controller={true}
          getTooltip= {({object}) => object && `${object.country} \n ${object.CityName}`}
        />
      </MapGL>
      <div>
        
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", height: nonMapHeight}}>
      <RadioButtons buttonColor = {red[800]} title = "First Algorithm" currentValue={firstAlgorithmValue.value} disabledValue = {secondAlgorithmValue.value} changeValue={firstAlgorithmValue.handleChange} startValue = {AlgorithmsEnum.BiggestInRadius}/>
      <div style={{width: 50}}/>
        <Box sx={{
          width: 600,
          height: 25,
          textAlign:"center"
        }}>
          Transparency
          <Slider 
            value={sliderProps.value} 
            aria-label="Default" 
            onChange={sliderProps.handleChange} 
            track={false}
            step = {5}
            marks={[
              {
                value: 25,
                label: "50%"
              },
              {
                value: 50,
                label: "100%"
              },
              {
                value: 75,
                label: "50%"
              }
            ]}
          />
        </Box>
        <div style={{width: 50}}/>
        <RadioButtons buttonColor = {blue[800]} title = "Second Algorithm" currentValue={secondAlgorithmValue.value} disabledValue = {firstAlgorithmValue.value} changeValue={secondAlgorithmValue.handleChange} startValue = {AlgorithmsEnum.ClosestCity}/>
      </div>
    </div>
    </div>
  );
  /*<Voronoi3 viewport={viewport} data={processedData}/>
        */
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
