import { ClosestCity } from "../algorithms/closestCity.js";
import { BiggestInRadius } from "../algorithms/BiggestInRadius.js";
import { PopRadius } from "../algorithms/PopRadius.js"

export const AlgorithmsEnum = {
  BiggestInRadius: "Biggest in Radius", 
  ClosestCity: "Closest City",
  PopRadius: "Biggest in Radius scaled by Population"
}

export default class Algorithms {
  static algorithmStateSwitch(algorithm, cityData, hotelData, parameters){
    switch(algorithm){
      case AlgorithmsEnum.BiggestInRadius:
        return BiggestInRadius.Process(cityData, hotelData, parameters)
        break;
      case AlgorithmsEnum.ClosestCity:
        return ClosestCity.Process(cityData, hotelData, parameters)
        break;
      case AlgorithmsEnum.PopRadius:
        return PopRadius.Process(cityData, hotelData, parameters)
        break;
    }
  }

  static parameterStateSwitch(props){
    switch(props.algorithm){
      case AlgorithmsEnum.BiggestInRadius:
        console.log("Case: " + AlgorithmsEnum.BiggestInRadius)
        return BiggestInRadius.getParameters(props.onClick)
      case AlgorithmsEnum.ClosestCity:
        return ClosestCity.getParameters()
      case AlgorithmsEnum.PopRadius:
        return PopRadius.getParameters()
    }
  }
}