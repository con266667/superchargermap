import { useCallback, useEffect, useState } from "react";
import ReactMapGL, { CircleLayer, Layer, Source } from 'react-map-gl';
import type {FeatureCollection, Feature} from 'geojson';
import "./App.css";

function App() {
  const [geojson, setGeojson] = useState<FeatureCollection>({type: 'FeatureCollection', features: []});

  const layerStyle: CircleLayer = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 7,
      'circle-color': '#e00206',
      'circle-stroke-color': 'white',
      'circle-stroke-width': 3,
    }
  };

  function isV3(location: Location) {
    return location.status === 'OPEN' && location.powerKilowatt === 250;
  }

  const convertLocations = useCallback((locations: Location[]) => {
    if (!locations || locations.length === 0) {
      return;
    }
    const features = locations.filter(isV3).map(locationToFeature);
    console.log('features', features);
    setGeojson((prev) => {
      let newGeojson = {...prev};
      newGeojson.features = features;
      return newGeojson;
    });
  }, []);

  function locationToFeature(location: Location) {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.gps.longitude, location.gps.latitude]
      },
      properties: {
        name: location.name,
      }
    } as Feature;
  }

  useEffect(() => {
    fetch('https://supercharge.info/service/supercharge/allSites').then((res) => res.json()).then((data) => {
      convertLocations(data);
    });
  }, [convertLocations]);

  return (
    <ReactMapGL
      mapLib={import('mapbox-gl')}
      mapboxAccessToken="pk.eyJ1IjoiY29ubm9ybndpbHNvbiIsImEiOiJjbHNjMGl1enEwand0MmtvNjVuczNic3JzIn0.DPs5mIMGAlT5-J-n621owg"
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5
      }}
      style={{width: window.innerWidth, height: window.innerHeight}}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Source type="geojson" data={geojson} >
        <Layer {...layerStyle} />
      </Source>
    </ReactMapGL>
  );
}

type Location = {
  id: number;
  locationId: string;
  name: string;
  status: string;
  address: {
      street: string;
      city: string;
      state: string;
      zip: null | string;
      countryId: number;
      country: string;
      regionId: number;
      region: string;
  };
  gps: {
      latitude: number;
      longitude: number;
  };
  dateOpened: string;
  stallCount: number;
  counted: boolean;
  elevationMeters: number;
  powerKilowatt: number;
  solarCanopy: boolean;
  battery: boolean;
  otherEVs: boolean;
  statusDays: number;
  urlDiscuss: boolean;
}

export default App;