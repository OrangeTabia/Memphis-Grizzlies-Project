import React from 'react';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

import ForcePlate from './Components/ForcePlate';
import TrackingFunc from './Components/Tracking';
import logo from './Images/nba-memphis-grizzlies-logo.png';
import headshot from './Images/headshot.png';
import './App.css';

// Typescript 'interface' defines the structure of an object and is used for type safety 
// and only used during compile time

export interface Force {
  ID: number;
  Date: string;
  Peak_Eccentric_Force: string;
  Peak_Concentric_Force: string;
  Jump_Height: string;
  Leg: string;
  Player: string;
}

export interface Tracking { 
  ID: number;
  Date: string;
  High_Accel: string;
  High_Decel: string;
  Distance: string;
  Player: string;
}

export interface Schedule { 
  ID: number;
  Date: string;
  Type: GameType
}

enum GameType {
  Practice,
  Game,
}

// enums for data accessiblity in different components 
export enum Granularity {
  Daily='daily',
  Weekly='weekly',
  Monthly='monthly'
}

export enum DataType {
  ForcePlate='Force Plate', 
  Tracking='Tracking'
}


function App() {
  // stores the data parsed from the three CSV files
  const [forceState, setForceStsate] = useState<Force[]>([]);
  const [trackingState, setTrackingState] = useState<Tracking[]>([]);
  const [scheduleState, setSchedulingState] = useState<Schedule[]>([]);

  const FORCE_PLATE = Papa.parse('force_plate.csv', {
    complete: function(forceResults) {
      // type assertion to ensure that Typescript understands the structure of the data
      setForceStsate(forceResults.data as Force[]);
    }, 
    delimiter: ',',
    download: true,
    header: true
  });

  const TRACKING_DATA = Papa.parse('tracking.csv', {
    complete: function(trackingResults) {
      setTrackingState(trackingResults.data as Tracking[]);
    },
    delimiter: ',',
    download: true,
    header: true
  });

  const SCHEDULE = Papa.parse('schedule.csv', {
    complete: function(scheduleResults) {
      setSchedulingState(scheduleResults.data as Schedule[]);
    },
    delimiter: ',',
    download: true,
    header: true
  });

  // These 4 lines of code gets an array of unique names of all the players extracted from the data
  const playersForce = forceState.map((player) => player["Player"]);
  const playersTracking = trackingState.map((player) => player["Player"]);
  const uniqueNames = new Set([...playersForce, ...playersTracking]);
  const uniqueNamesArray = Array.from(uniqueNames);

  // state for player selected when clicked
  const [selectedPlayer, setPlayer] = useState<String>();
  // state for force data to be displayed when clicked
  const [playerForceData, setPlayerForceData] = useState<Force[]>([]);
  // state for tracking data to be displayed when clicked
  const [playerTrackingData, setPlayerTrackingData] = useState<Tracking[]>([]);

  // state for type of data when selected - default is Force Plate data
  const [selectedDataType, setDataType] = useState<DataType>(DataType.ForcePlate);
  // state for displaying either daily, weekly, or monthly data - default is the daily view of data
  const [selectedGranularity, setGranularity] = useState<Granularity>(Granularity.Daily);


  // Use Effect so that any time a new player is selected, we'll filter to the players data
  useEffect(() => {
    if (selectedPlayer) { 
      setPlayerForceData(forceState.filter((player) => player["Player"] === selectedPlayer));
      setPlayerTrackingData(trackingState.filter((player) => player["Player"] === selectedPlayer));
    }
  }, [selectedPlayer]); 



  return (
    <div className="App">

      <div className="nav-bar-container">
        <img src={logo} className="memphis-logo" alt="logo" />
      </div>

      <div className="player-data">
        <select
            value={undefined}
            onChange={(e) => {
              setPlayer(e.target.value)
            }}
          >
            <option disabled selected>--Select a Player--</option>
            {uniqueNamesArray.map((player) => (
              <option>
                {player}
              </option>
            ))}
        </select>
        
        
        {
          // conditionally renders the data once a player is selected
        selectedPlayer != null && 
        <>
          <select
            onChange={(e) => {
              // need to add 'as DataType' in order for TypeScript to understand 
              // the value from the select element because setDataType expects a value of type DataType 
              setDataType(e.target.value as DataType)
            }}
          >
            <option disabled selected>--Select Data--</option>
            <option value={DataType.ForcePlate}>Force Plate</option>
            <option value={DataType.Tracking}>Tracking</option>
          </select>
        </>
        }

        {
          // conditionally renders the granularity choices once a player is selected
        selectedPlayer != null && 
        <>
          <select onChange={(e) => setGranularity(e.target.value as Granularity)}>
            <option disabled selected>--Select a View--</option>
            <option value={Granularity.Daily}>Daily</option>
            <option value={Granularity.Weekly}>Weekly</option>
            <option value={Granularity.Monthly}>Monthly</option>
          </select>
        </>
        }
      </div>

      <div className="player-info">
        <div className="profile">
          {selectedPlayer != null && (
            <>
              <h2>{selectedPlayer}</h2>
              <img id="headshot" src={headshot} alt="headshot"/>
              <p>#22</p>
              <p>Guard</p>
            </>
          )}
        </div>

        <div className="data">
          {
            // when a player is selected, pass through to the components the filtered
            // data set that is dictated by the player component
          selectedPlayer != null &&  (
            <>
              {
                selectedDataType == DataType.ForcePlate &&
                (playerForceData.length > 0 ? 
                <ForcePlate
                  forceData={playerForceData}
                  selectedGranularity={selectedGranularity}
                  schedule={scheduleState}
                />
                : ('Force plate data not available for user'))
              }

              {
                selectedDataType == DataType.Tracking &&
                (playerTrackingData.length > 0 ? 
                <TrackingFunc
                  trackingData={playerTrackingData}
                  selectedGranularity={selectedGranularity}
                  schedule={scheduleState}
                /> : ('Tracking data not available for user'))
              }
            </>
            )
          }
        </div>

      </div>
    </div>
  );
}

export default App;

