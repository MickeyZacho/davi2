import React, { useEffect, useState } from "react";
import DeckGL, { WebMercatorViewport, SolidPolygonLayer, PolygonLayer } from "deck.gl";
import MapGL, { _useMapControl as useMapControl}  from 'react-map-gl';
import renderLayers from "./Layers.js";
import { CountryFinder } from "./algorithms/CountryFinder.js";
import { Delaunay } from "d3-delaunay";
import {BinarySearchTree} from "./SearchTree.js"
import { kdTree } from "kd-tree-javascript"
import Voronoi from "./voronoi.js";
import Voronoi2 from "./voronoi2.js";
import Voronoi3 from "./voronoi3.js";
import Voronoi4 from "./voronoi4.js";
import Voronoi5 from "./voronoi5.js";
import FuncVoronoi from "./FuncVoronoi.js";
import { apiBase } from "./api.js";
import { ClosestCity } from "./algorithms/closestCity.js";
import * as d3 from "d3";
import Box from '@mui/material/Box';
import { Slider } from '@mui/material';
import { BiggestInRadius } from "./algorithms/BiggestInRadius.js";
import RadioButtons from "./components/algorithmselector.js";
import { AlgorithmsEnum } from "./Util/Algorithms.js"
import { red, blue } from '@mui/material/colors';
import Algorithms from './Util/Algorithms.js'

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./worldcities3.csv";
const HOTEL_URL = "./hotelsout/";
const DATA_PATH = "./CountryPop/";

export default () => {
  
  
  const [data, setData] = useState({value:[]});
  const [hotelData, setHotelData] = useState({value:[]})
  const [countryHotelData, setCountryHotelData] = useState({value:[]})
  const [countryCityData, setCountryCityData] = useState({value:[]})
  
  const [processedData, setProcData] = useState({})
  const [processedData2, setProcData2] = useState({})
  const [vorData, setVorData] = useState({})
  const [vorData2, setVorData2] = useState({})
  const [polData, setPolData] = useState({})
  const [polData2, setPolData2] = useState({})
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
    
    function calculateVor(data){
      //const point = data.map(d => d.position);
      const delau = Delaunay.from(data, (d)=> d.position[0], (d)=>d.position[1])
    
      const vor = delau.voronoi([-179,-89,179,89])
      
      const it = vor.cellPolygons();
      let res = it.next()
    
      const kdt = new kdTree([], (a,b)=>Math.sqrt(Math.pow(a.lat-b.lat,2)+Math.pow(a.lng-b.lng,2)), ["lat","lng"])
      //console.log(kdt)
      data.forEach(e => {
        let nPos = e.position
        let entry = {
          lng: nPos[0],
          lat: nPos[1],
          cityName: e.CityName,
          country: e.country
        }
        kdt.insert(entry)
      });
      const tree = new BinarySearchTree()
      let cityLines = new Map();

      while(!res.done){
        //For every cell in the voronoi, calculate the corresponding hotel, by looking in the kd-tree of hotels
        let averageX = res.value.reduce((acc, c) => acc+(c[0]), 0)/res.value.length
        let averageY = res.value.reduce((acc, c) => acc+(c[1]), 0)/res.value.length

        let near = kdt.nearest({lng: averageX, lat: averageY}, 1)[0][0] //returns a hotel data point {lng, lat, cityName, country}

        for(let i = 0; i < res.value.length; i++){
          //Calculate all lines drawn, for a cell, including the last element to the first element
          let posA = res.value[i]
          let posB = res.value[((i+1) % res.value.length)]
          //Create a path object, with the corresponding city and country of the hotel
          let path = {a: posA, b: posB, cityName: near.cityName, country: near.country}
          //Check for wierd case, where start and end position is the same
          if(posA[0]===posB[0] && posA[1]===posB[1]) continue
          //Check if path is on the border
          if((posA[0] === 179 && posB[0] === 179) || (posA[0]===-179 && posB[0]===-179) || (posA[1] === 89 && posB[1] === 89) || (posA[1]===-89 && posB[1]===-89)){
            
            if(cityLines.get( near.cityName)===undefined) cityLines.set( near.cityName, [])
            cityLines.get(near.cityName).push({a: posA, b: posB, sameCountry: true})
            continue
          }
          //Identify a path by the sum of the lat and long values, hopefully being unique, for faster search, and to equal a path from a to b and from b to a
          let a = posA[0]+posA[1]
          let b = posB[0]+posB[1]
          let nPath = tree.insert(a+b, path)
          //When inserting, we return null if there wasn't an already existing element, otherwise we return the already existing, meaning we found a match
          //Check if the city of the found path is different from the current cell, otherwise we don't want to draw the path
          
          if(nPath === null || nPath.cityName === near.cityName) continue  
          //If city path array not initialised, initialize them
          if(cityLines.get( near.cityName)===undefined) cityLines.set( near.cityName, [])
          if(cityLines.get(nPath.cityName)===undefined) cityLines.set(nPath.cityName, [])
          //Add the path to the cityLines, and check if the line splits two countries
          cityLines.get(near.cityName).push({a: posA, b: posB, sameCountry: near.country === nPath.country})
          cityLines.get(nPath.cityName).push({a: nPath.a, b: nPath.b, sameCountry: near.country == nPath.country})
          
        }
        res = it.next()
      }
      return cityLines
    }
    function calculatePolygons(data){
      let polygonMap = new Map()
      
      data.forEach((value, key)=>{
        console.log(key)
        //if(key === "No City") return []
        let entry = value[0]
        value.splice(value.indexOf(entry),1)
        let polyCount = 0
        let currentPos = entry.b
        let path = []
        path.push([entry.a, entry.b])
        do{
          let next = value.find((e)=>{return e.a[0] === currentPos[0] && e.a[1] === currentPos[1]})
          
          if(next !== undefined) {
            value.splice(value.indexOf(next),1)
            path[polyCount].push(next.b)
            currentPos = next.b
          }else {
            console.log(value)
            //path[polyCount].push(entry.a)
            entry = value[0]
            value.splice(value.indexOf(entry),1)
            currentPos = entry.b
            path.push([entry.a, entry.b])
            polyCount += 1
          }
        }while(value.length>0)
        
        console.log(path)
        polygonMap.set(key, path)
      })
      return polygonMap
    }
    
    let procData = BiggestInRadius.Process(countryCityData, countryHotelData)
    let procData2 = ClosestCity.Process(countryCityData, countryHotelData)
    let vor1 = calculateVor(procData)
    let vor2 = calculateVor(procData2)
    let pol1 = calculatePolygons(vor1)
    let pol2 = calculatePolygons(vor2)
    
    setProcData(procData)
    setProcData2(procData2)
    setVorData(vor1)
    setVorData2(vor2)
    setPolData(pol1)
    setPolData2(pol2)
  },[countryCityData,countryHotelData]);

  useEffect(()=>{
    try{
      let filteredHotels = hotelData.filter(e=>e.country === curCountry)
      let filteredCities = data.filter(e=>e.country === curCountry)
      setCountryCityData(filteredCities)
      setCountryHotelData(filteredHotels)
    }catch{}
    
  },[curCountry])
  // The height of the bottom part of the visualization scales lineary with how many algorithms exists in the enum + 50 because of the title
  const nonMapHeight = Object.keys(AlgorithmsEnum).length * 50 + 50;
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
    
    console.log("Check country This is run")
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
        <Voronoi5 viewport={viewport} data={polData} opacity={sliderProps.value / 100} colorString={"blue"}/>
        <Voronoi5 viewport={viewport} data={polData2} opacity={1-sliderProps.value / 100} colorString={"red"}/>
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
      <div style={{width: 50}}/>
      <Algorithms.parameterStateSwitch algorithm={firstAlgorithmValue.value} />
      <div style={{width: 50}}/>
      <RadioButtons buttonColor = {red[800]} title = "First Algorithm" changeValue={firstAlgorithmValue.handleChange} startValue={firstAlgorithmValue.value} />
      <div style={{width: 50}}/>
        <Box sx={{
          width: 1000,
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
        <RadioButtons buttonColor = {blue[800]} title = "Second Algorithm" changeValue={secondAlgorithmValue.handleChange} startValue={secondAlgorithmValue.value} />  
        <div style={{width: 50}}/>
        <Algorithms.parameterStateSwitch algorithm={secondAlgorithmValue.value} />
        <div style={{width: 50}}/>
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
