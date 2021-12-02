import React, { useEffect, useState } from "react";
import DeckGL, {
  WebMercatorViewport,
  SolidPolygonLayer,
  PolygonLayer,
  HeatmapLayer,
} from "deck.gl";
import MapGL, { _useMapControl as useMapControl } from "react-map-gl";
import renderLayers from "./Layers.js";
import { CountryFinder } from "./algorithms/CountryFinder.js";
import { Delaunay } from "d3-delaunay";
import { kdTree } from "kd-tree-javascript";
import * as d3 from "d3";
import Box from "@mui/material/Box";
import { Button, Slider } from "@mui/material";
import RadioButtons from "./components/algorithmselector.js";
import Settings from "./components/sideParameters";
import { AlgorithmsEnum } from "./Util/Algorithms.js";
import { red, blue } from "@mui/material/colors";
import Algorithms from "./Util/Algorithms.js";
import {calculatePolygons, calculateVor, combineProc} from "./Util/Calculate.js"
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXTOKEN;
const DATA_URL = "./worldcities3.csv";
const HOTEL_URL = "./hotelsout/";
const DATA_PATH = "./CountryPop/";
const COLOR_HOTEL = [0, 153, 136];
const COLOR_CITY = [51, 187, 238];
const COLOR_FIRST_ALGORITHM = [187, 187, 187]
const COLOR_SECOND_ALGORITHM = [0, 119, 187]
const COLOR_PROBLEM_AREA = [204, 51, 17]

export default () => {
  const [data, setData] = useState([]);
  const [hotelData, setHotelData] = useState([]);
  const [countryHotelData, setCountryHotelData] = useState([]);
  const [countryCityData, setCountryCityData] = useState([]);

  const [processedData, setProcData] = useState([]);
  const [processedData2, setProcData2] = useState([]);
  const [vorData, setVorData] = useState([]);
  const [vorData2, setVorData2] = useState([]);
  const [polData, setPolData] = useState([]);
  const [polData2, setPolData2] = useState([]);
  const [combData, setCombData] = useState([]);
  const [posToCountry, setPosToCountry] = useState({});
  const [curCountry, setCurCountry] = useState({});
  const [sliderProps, setSliderProps] = useState({
    value: 20,
    handleChange: (event, newValue) => {
      setSliderProps((s) => ({
        ...s,
        value: newValue,
      }));
    },
  });
  const defaultParams = {
    biggestInRadius: { radius: 50 },
    closestCity: {
      scale: 1
    },
    biggestPopScale: {
      scale: 0.08
    }
  }
  const [firstAlgorithmValue, setFirstAlgorithmValue] = useState({
    value: AlgorithmsEnum.BiggestInRadius,
    parameters: { radius: 50 },
    handleChangeParam: (event, newParam) => {
      setFirstAlgorithmValue((s) => ({
        ...s,
        parameters: newParam,
      }));
    },

    handleChangeSelected: (event, newValue) => {
      switch (newValue) {
        case AlgorithmsEnum.BiggestInRadius:

          setFirstAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestInRadius,
            value: newValue,
          }))
          break;
        case AlgorithmsEnum.ClosestCity:
          setFirstAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.closestCity,
            value: newValue,
          }))
          break;
        case AlgorithmsEnum.PopRadius:
          setFirstAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestPopScale,
            value: newValue,
          }))
          break;  
      }
    }
  });
  const [secondAlgorithmValue, setSecondAlgorithmValue] = useState({
    value: AlgorithmsEnum.ClosestCity,
    parameters: {},
    handleChangeParam: (event, newParam) => {
      setSecondAlgorithmValue((s) => ({
        ...s,
        parameters: newParam,
      }));
    },
    handleChangeSelected: (event, newValue) => {
      //console.log("Got here")
      
      switch (newValue) {
        case AlgorithmsEnum.BiggestInRadius:
          setSecondAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestInRadius,
            value: newValue,
          }))
          break;
        case AlgorithmsEnum.ClosestCity:
          setSecondAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.closestCity,
            value: newValue,
          }))
          break;
        case AlgorithmsEnum.PopRadius:
          setSecondAlgorithmValue((s) => ({
            ...s,
            parameters: defaultParams.biggestPopScale,
            value: newValue,
          }))
          break;  
      }
    }
  });

  const [sideParameterCitySetting, setSideParameterCitySetting] = useState({
    value: true,
    handleChange: (event, newValue) => {
      setSideParameterCitySetting({
        handleChange: sideParameterCitySetting.handleChange,
        value: newValue
      });
    },
  });
  const [sideParameterHotelSetting, setsideParameterSettings] = useState({
    value: true,
    handleChange: (event, newValue) => {
      setsideParameterSettings({
        handleChange: sideParameterHotelSetting.handleChange,
        value: newValue
      });
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const countries = [
        "Denmark",
        "Sweden",
        "Norway",
        "Hong Kong",
        "Singapore",
        "Liechtenstein",
        "Luxembourg",
        "Iceland",
        "Turkey",
        "Poland",
        "Finland",
        "Netherlands",
        "Greece",
        "Germany",
        "United States",
        "United Kingdom",
        "Ireland",
        "France",
        "Spain",
        "Portugal",
        "Korea, South",
        "China",
        "Indonesia",
        "Belgium",
        "Italy",
        "Austria",
        "Slovakia",
        "Hungary",
        "Romania",
        "Moldova",
        "Serbia",
        "Bosnia And Herzegovina",
        "Slovenia",
        "Czechia",
        "Switzerland",
        "Macedonia",
        "Albania",
        "Bulgaria",
        "Kosovo",
        "Croatia",
        "Ukraine",
        "Belarus",
        "Lithuania",
        "Latvia",
        "Estonia",
        "Georgia",
        "Japan",
        "Thailand",
        "Taiwan",
        "Vietnam",
        "Philippines",
        "Romania",
        "Malaysia",
        "India",
        "Canada",
        "Cambodia",
        "Laos",
      ];
      let result = [];
      var counter = 0;
      for (var i = 0; i < countries.length; i++) {
        await d3.csv(DATA_PATH + countries[i] + ".csv").then((data) => {
          for (var j = 0; j < data.length; j++) {
            if (data[j].population < 10000) continue;
            result.push(data[j]);
            counter++;
          }
        });
      }
      //console.log("counter: " + counter);
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
          country: d.country,
        };
      });
      const finalpoints = points.filter((point) => point.population !== "");
      //console.log("GOT HERE");
      setData(finalpoints);
    };

    const fetchData2 = async () => {
      let result = [];
      var counter = 0;
      for (var i = 0; i < 291; i++) {
        await d3.json(HOTEL_URL + "hotels" + i + ".json").then((data) => {
          for (var j = 0; j < data.Hotels.length; j++) {
            //if(data.Hotels[j].Latitude>100 || data.Hotels[j].Latitude<-100) continue
            result.push(data.Hotels[j]);
            counter++;
          }
        });
      }
      //console.log("This was also reached");
      //console.log("counter: " + counter);
      const points = result.map(function (d) {
        //console.log(d);
        //console.log(d.city)

        return {
          hotelId: d.id,
          position: [+d.Longitude, +d.Latitude],
          country: d.Country,
        };
      });
      //console.log("GOT HERE");
      setHotelData(points);
      setPosToCountry(new CountryFinder(points));
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
    fetchData();
    fetchData2();
  }, []);

  useEffect(() => {
    console.log("Calculating")
    
    /*function calculateVor(data) {
      //const point = data.map(d => d.position);
      const delau = Delaunay.from(
        data,
        (d) => d.position[0],
        (d) => d.position[1]
      );

      const vor = delau.voronoi([-179, -89, 179, 89]);

      const it = vor.cellPolygons();
      let res = it.next();

      const kdt = new kdTree(
        [],
        (a, b) =>
          Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)),
        ["lat", "lng"]
      );
      //console.log(kdt)
      data.forEach((e) => {
        let nPos = e.position;
        let entry = {
          lng: nPos[0],
          lat: nPos[1],
          cityName: e.CityName,
          country: e.country,
          cityPos: e.cityPos
        };
        kdt.insert(entry);
      });

      const lineMap = new Map();
      let cityLines = new Map();

      while (!res.done) {
        //For every cell in the voronoi, calculate the corresponding hotel, by looking in the kd-tree of hotels
        let averageX =
          res.value.reduce((acc, c) => acc + c[0], 0) / res.value.length;
        let averageY =
          res.value.reduce((acc, c) => acc + c[1], 0) / res.value.length;

        let near = kdt.nearest({ lng: averageX, lat: averageY }, 1)[0][0]; //returns a hotel data point {lng, lat, cityName, country}

        for (let i = 0; i < res.value.length; i++) {
          //Calculate all lines drawn, for a cell, including the last element to the first element
          let posA = res.value[i];
          let posB = res.value[(i + 1) % res.value.length];
          //Create a path object, with the corresponding city and country of the hotel
          let path = {
            a: posA,
            b: posB,
            cityName: near.cityName,
            country: near.country,
            cityPos: near.cityPos
          };
          //Check for wierd case, where start and end position is the same
          if (posA[0] === posB[0] && posA[1] === posB[1]) continue;
          //Check if path is on the border
          if (
            (posA[0] === 179 && posB[0] === 179) ||
            (posA[0] === -179 && posB[0] === -179) ||
            (posA[1] === 89 && posB[1] === 89) ||
            (posA[1] === -89 && posB[1] === -89)
          ) {
            if (cityLines.get(near.cityName) === undefined)
              cityLines.set(near.cityName, []);
            cityLines
              .get(near.cityName)
              .push({ a: posA, b: posB, sameCountry: true , cityPos: near.cityPos});
            continue;
          }
          //Identify a path by the sum of the lat and long values, hopefully being unique, for faster search, and to equal a path from a to b and from b to a
          let a = posA[0] + posA[1];
          let b = posB[0] + posB[1];
          let id = "" + posA[0] + posA[1] + posB[0] + posB[1]
          if (a < b) id = "" + posB[0] + posB[1] + posA[0] + posA[1]
          let nPath = lineMap.get(id)
          if (nPath === undefined)
            lineMap.set(id, path);
          //When inserting, we return null if there wasn't an already existing element, otherwise we return the already existing, meaning we found a match
          //Check if the city of the found path is different from the current cell, otherwise we don't want to draw the path

          if (nPath === undefined || nPath.cityName === near.cityName) continue;
          //If city path array not initialised, initialize them
          if (cityLines.get(near.cityName) === undefined)
            cityLines.set(near.cityName, []);
          if (cityLines.get(nPath.cityName) === undefined)
            cityLines.set(nPath.cityName, []);
          //Add the path to the cityLines, and check if the line splits two countries
          cityLines
            .get(near.cityName)
            .push({
              a: posA,
              b: posB,
              sameCountry: near.country === nPath.country,
              cityPos: near.cityPos 
            });
          cityLines
            .get(nPath.cityName)
            .push({
              a: nPath.a,
              b: nPath.b,
              sameCountry: near.country == nPath.country,
              cityPos: nPath.cityPos
            });
        }
        res = it.next();
      }
      return cityLines;
    }
    function calculatePolygons(data) {
      //let polygonMap = new Map();
      let polys = []
      data.forEach((value, key) => {
        //console.log(key);
        //if(key === "No City") return []
        let entry = value[0];
        value.splice(value.indexOf(entry), 1);
        let polyCount = 0;
        let currentPos = entry.b;
        let path = [];
        path.push([entry.a, entry.b]);
        do {
          let next = value.find((e) => {
            return e.a[0] === currentPos[0] && e.a[1] === currentPos[1];
          });

          if (next !== undefined) {
            value.splice(value.indexOf(next), 1);
            path[polyCount].push(next.b);
            currentPos = next.b;
          } else {
            polys.push({CityName: key, polygon: path[polyCount], cityPos: entry.cityPos})
            
            //console.log(value);
            //path[polyCount].push(entry.a)
            entry = value[0];
            value.splice(value.indexOf(entry), 1);
            currentPos = entry.b;
            path.push([entry.a, entry.b]);
            polyCount += 1;
          }
          polys.push({CityName: key, polygon: path[polyCount], cityPos: entry.cityPos})
        } while (value.length > 0);

        //console.log(path);
       // polygonMap.set(key, path);
        //polygonMap.set(key, path);
      });
      //testing code
      //let polys = []
      //polygonMap.forEach(value => value.forEach(v => polys.push(v)))
      return polys;
      //return polygonMap;
    }*/

    let procData = Algorithms.algorithmStateSwitch(firstAlgorithmValue.value, countryCityData, countryHotelData, firstAlgorithmValue.parameters)
    let procData2 = Algorithms.algorithmStateSwitch(secondAlgorithmValue.value, countryCityData, countryHotelData, secondAlgorithmValue.parameters)
    console.log(1,procData)
    console.log(2,procData2);
    let vor1 = calculateVor(procData);
    let vor2 = calculateVor(procData2);
    let pol1 = calculatePolygons(vor1);
    let pol2 = calculatePolygons(vor2);

    let combine = combineProc(procData, procData2)

    setProcData(procData);
    setProcData2(procData2);
    setVorData(vor1);
    setVorData2(vor2);
    setPolData(pol1);
    setPolData2(pol2);
    setCombData(combine);
  }, [countryCityData, countryHotelData, firstAlgorithmValue, secondAlgorithmValue]);

  useEffect(() => {
    try {
      let filteredHotels = hotelData.filter((e) => e.country === curCountry);
      let filteredCities = data.filter((e) => e.country === curCountry);
      setCountryCityData(filteredCities);
      setCountryHotelData(filteredHotels);
    } catch { }
  }, [curCountry]);
  // The height of the bottom part of the visualization scales lineary with how many algorithms exists in the enum + 50 because of the title
  const nonMapHeight = Object.keys(AlgorithmsEnum).length * 50 + 50;
  const [viewport, setViewport] = useState(
    new WebMercatorViewport({
      width: window.innerWidth,
      height: window.innerHeight - 20,
      longitude: -3.2943888952729092,
      latitude: 53.63605986631115,
      zoom: 4,
      maxZoom: 16,
      pitch: 0,
      bearing: 0,
    })
  );
  useEffect(() => {
    if(viewport.zoom < 6) return
    try {
      //console.log(curCountry)
      let position = [viewport.longitude, viewport.latitude];
      let country = posToCountry.query(position);
      if (country !== curCountry) {
        console.log("Updating country to " + country + " - " + viewport.zoom)
        setCurCountry(country);
      }
    } catch { }

    //console.log("Check country This is run");
  }, [viewport]);

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

  const zoomed = viewport.zoom >= 6;
  const layers = [
    new PolygonLayer({
      id: "polygon-layer",
      data: polData,
      stroked: true,
      filled: true,
      wireframe: false,
      visible: zoomed,
      opacity: 1- sliderProps.value / 100, 
      extruded: false,
      pickable: false,
      lineWidthMinPixels: 1,
      getPolygon: (d) => d.polygon,
      getFillColor: [0, 0, 0, 0],
      getLineColor: COLOR_FIRST_ALGORITHM,
      getLineWidth: 1,
      highlightColor: [255,0,0,20],
      autoHighlight: true,
      //onHover: (info) => handleOnHover(info),
    }),
    new PolygonLayer({
      id: "polygon-layer2",
      data: polData2,
      stroked: true,
      filled: true,
      wireframe: false,
      visible: zoomed,
      opacity: sliderProps.value / 100,
      extruded: false,         
      pickable: false,
      lineWidthMinPixels: 1,
      getPolygon: (d) => d.polygon,
      getFillColor: [0, 0, 0, 0],
      getLineColor: COLOR_SECOND_ALGORITHM,
      getLineWidth: 1,
      highlightColor: [0,0,255,20],
      autoHighlight: true,
      //onHover: (info) => handleOnHover(info),
    }),
    new PolygonLayer({
      id: "polygon-layer3",
      data: combData,
      stroked: false,
      filled: true,
      wireframe: false,
      visible: zoomed,
      opacity: 0.50,
      extruded: false,
      pickable: true,
      lineWidthMinPixels: 1,
      getPolygon: (d) => d.polygon,
      getFillColor: (d) => [0, 255, 0, d.sameCity?0:30],
      getLineColor: [0, 0, 0],
      getLineWidth: 1,
      highlightColor: [0,0,255,20],
      autoHighlight: true,
      onHover: (info) => handleOnHover(info),
    }),
    renderLayers({
      data: countryCityData,
      color: COLOR_CITY,
      size: 5,
      opacity: 0.5,
      visible: zoomed && sideParameterCitySetting.value,
    }),
    renderLayers({
      data: processedData,
      color: COLOR_HOTEL,
      size: 2,
      opacity: 0.2,
      visible: zoomed && sideParameterHotelSetting.value,
    }),
    new HeatmapLayer({
      id: 'heatmapLayer',
      data: hotelData,
      getPosition: d => (d.position),
      getWeight: 1,
      aggregation: 'SUM',
      visible: !zoomed
    })
  ];
  
  function handleOnHover(info) {
    const { x, y, object } = info
    let polygonStatsA = document.getElementById("polygonStatsA");
    let polygonStatsB = document.getElementById("polygonStatsB");
    if (object) {
      polygonStatsA.innerHTML = `
        <div><b>City: </b>${object.CityNameA}</div>
      `;
      
      polygonStatsB.innerHTML = `
        <div><b>City: </b>${object.CityNameB}</div>
      `;
    }
  }
  /*<svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}>
            <Voronoi5
              viewport={viewport}
              data={polData}
              opacity={sliderProps.value / 100}
              colorString={"blue"}
            />
            <Voronoi5
              viewport={viewport}
              data={polData2}
              opacity={1 - sliderProps.value / 100}
              colorString={"red"}
            />
        <Voronoi5 viewport={viewport} data={polData} opacity={sliderProps.value / 100} colorString={"blue"}/>
        <Voronoi5 viewport={viewport} data={polData2} opacity={1-sliderProps.value / 100} colorString={"red"}/>
          </svg>*/
  


  return (

    <div style={{ height: "100vh" }}>
      <div>
        <MapGL
          {...viewport}
          mapStyle={"mapbox://styles/mapbox/light-v10"}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          preventStyleDiffing={false}
          onViewportChange={(v) => setViewport(new WebMercatorViewport(v))}
          text-allow-overlap={false}
        >

          <svg viewBox={`0 0 ${viewport.width} ${viewport.height}`}>
          </svg>
          <DeckGL
            layers={layers}
            initialViewState={viewport}
            controller={true}
          />
        </MapGL>
        <div
          style={{
            position: "absolute",
            width: nonMapHeight,
            height: viewport.height - nonMapHeight - 100,
            right: 10,
            top: 10,
            display: "flex",
            justifyContent: "space-between",
            marginLeft: 25,
            marginRight: 25,
            marginTop: 10,
            marginBottom: 10,
            opacity: 1,
            backgroundColor: "white",

            borderRadius: "25px",
            border: "2px solid #4c768d"
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            width: nonMapHeight,
            height: viewport.height - nonMapHeight - 100,
            top: 10,
            right: 10,
            display: "flex",
            justifyContent: "left",
            alignItems: "top",
            marginLeft: 50,
            marginRight: 10,
            marginBottom: 20,
          }}
        ><div class="column">
            <div class="row">
              <Settings
                citySetting={sideParameterCitySetting.value}
                hotelSetting={sideParameterHotelSetting.value}
                changeCityValue={sideParameterCitySetting.handleChange}
                changeHotelValue={sideParameterHotelSetting.handleChange}
                cityColor={COLOR_CITY}
                hotelColor={COLOR_HOTEL}
              />
            </div>
            <div class="row">
              <div id="polygonStatsA"></div>
              
              <div id="polygonStatsB"></div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            width: viewport.width - 100,
            height: viewport.height,
            bottom: 10,
            display: "flex",
            justifyContent: "space-between",
            height: nonMapHeight,
            marginLeft: 25,
            marginRight: 25,
            marginTop: 10,
            marginBottom: 10,
            opacity: 1,
            backgroundColor: "white",

            borderRadius: "25px",
            border: "2px solid #4c768d"
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            width: viewport.width - 150,
            height: viewport.height,
            bottom: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: nonMapHeight,
            marginLeft: 50,
            marginRight: 10,
            marginBottom: 20,
          }}
        >
          <Algorithms.parameterStateSwitch
            algorithm={firstAlgorithmValue.value}
            onClick={firstAlgorithmValue.handleChangeParam}
          />
          <RadioButtons
            buttonColor={COLOR_FIRST_ALGORITHM}
            title="First Algorithm"
            changeValue={firstAlgorithmValue.handleChangeSelected}
            startValue={firstAlgorithmValue.value}

          />
          <Box
            sx={{
              width: 800,
              alignItems: 'center',
            }}
          >
            Transparency
            <Slider
              value={sliderProps.value}
              aria-label="Slider"
              onChange={sliderProps.handleChange}
              track={false}
              step={5}
              marks={[
                {
                  value: 25,
                  label: "50%",
                },
                {
                  value: 50,
                  label: "100%",
                },
                {
                  value: 75,
                  label: "50%",
                },
              ]}
            />
          </Box>
          <RadioButtons
            buttonColor={COLOR_SECOND_ALGORITHM}
            title="Second Algorithm"
            changeValue={secondAlgorithmValue.handleChangeSelected}
            startValue={secondAlgorithmValue.value}
          />
          <Algorithms.parameterStateSwitch
            algorithm={secondAlgorithmValue.value}
            onClick={secondAlgorithmValue.handleChangeParam}
          />

        </div>
      </div>
      <div id="tooltip" style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none' }} />
    </div>

  );
};
