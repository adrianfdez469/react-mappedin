import React, { useEffect, useRef, useState } from 'react';
import { getVenue, showVenue, E_SDK_EVENT } from '@mappedin/mappedin-js';
import { venueData } from '../../utils/constants/mapConstants';
import '@mappedin/mappedin-js/lib/mappedin.css';
import './mapView.css';

export const Map = props => {
  const { close } = props;
  const [venuLevels, setVenueLevels] = useState([]);
  const [venueLocations, setVenueLocatios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const divRef = useRef();
  const venueRef = useRef();
  const mapViewRef = useRef();
  
  const levelSelecRef = useRef();
  const dirOriginRef = useRef();
  const dirDestinyRef = useRef();

  const onSelectLvl = (event) => {
    const id = event.target.value;
    mapViewRef.current.setMap(id);
    mapViewRef.current.labelAllLocations();
  }

  const getPath = () => {
    
    if(dirOriginRef.current.value && dirDestinyRef.current.value){
      const startLocation = venueRef.current.locations.find(loc => loc.id === dirOriginRef.current.value);
      const endLocation = venueRef.current.locations.find(loc => loc.id === dirDestinyRef.current.value);
      const directions = startLocation.directionsTo(endLocation);
      console.log('directions', directions);
      mapViewRef.current.Journey.draw(directions);
    } else {
      alert("Select Origin and Destiny");
    }
  }

  

  useEffect(() => {
    (
      async () => {
        const venue = await getVenue(venueData);
        venueRef.current = venue;
        const mapview = await showVenue(divRef.current, venueRef.current);
        mapViewRef.current = mapview;
        
        mapview.addInteractivePolygonsForAllLocations();
        mapview.labelAllLocations({ flatLabels: true });
        
        setLoading(false);
        

        setVenueLevels(
          venue.maps
          .sort((lvl_A, lvl_B)=> lvl_B.elevation - lvl_A.elevation)
          .map(lvl => ({
            id: lvl.id,
            name: lvl.name
          }))
        );

        setVenueLocatios(
          venue.locations
            .sort((a,b)  => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
            .filter(l => l.polygons.length !== 0)
            .map(l => ({
              id: l.id,
              name: l.name
            }))
        );
        levelSelecRef.current.value = mapview.currentMap.id;
      }
    )();
  }, []);
  
  return (
    <div ref={divRef}>
      {loading 
        ? <h1 style={{textAlign: 'center'}}>Loading map...</h1> 
        :
        <>
          <button 
            onClick={close} 
            style={{position: 'fixed', left: 0, top: 0, padding: '5px'}}
          >
            Close Map
          </button>
          <select ref={levelSelecRef} onChange={onSelectLvl}>
            {venuLevels.map(lvl => {
              return <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
            })}
          </select>

          <select ref={dirOriginRef}>
            {venueLocations.map(loc => {
              return <option key={loc.id} value={loc.id}>{loc.name}</option>;
            })}
          </select>
          <select ref={dirDestinyRef}>
            {venueLocations.map(loc => {
              return <option key={loc.id} value={loc.id}>{loc.name}</option>;
            })}
          </select>
          <button onClick={getPath}>GO</button>
        </>
      }
      

    </div>
  );
  
}