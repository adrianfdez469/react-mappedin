import React, { useState } from 'react';

import { Map } from './mapView';



export const MapParent = props => {

  const [showMap, setShowMap] = useState();

  const showMyMap = () => {
    setShowMap(true);
  }
  const hideMyMap = () => {
    setShowMap(false);
    
  }

  const map = showMap ? (
    <Map>
      <button onClick={hideMyMap}>Close Map</button>
    </Map>
  ) : null;

  return (
    <>
      {!showMap && <button onClick={showMyMap}>Show Map</button>}
      {map}
    </>
  );

}