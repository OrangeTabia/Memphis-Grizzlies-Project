import React from 'react';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

import ForcePlate from './Components/ForcePlate';
import TrackingFunc from './Components/Tracking';
import logo from './Images/nba-memphis-grizzlies-logo.png';
import headshot from './Images/headshot.png';
import './App.css';


export interface Force {
  ID: Number;
  Date: String;
  Peak_Eccentric_Force: string;
  Peak_Concentric_Force: string;
  Jump_Height: string;
  Leg: String;
  Player: String;
}

export interface Tracking { 
  ID: Number;
  Date: String;
  High_Accel: string;
  High_Decel: string;
  Distance: string;
  Player: String;
}

enum GameType {
  Practice,
  Game,
}

export enum Granularity {
  Daily='daily',
  Weekly='weekly',
  Monthly='monthly'
}

export enum DataType {
  ForcePlate='Force Plate', 
  Tracking='Tracking'
}

export interface Schedule { 
  ID: Number;
  Date: String;
  Type: GameType
}


function App() {
  const [forceState, setForceStsate] = useState<Force[]>([]);
  const [trackingState, setTrackingState] = useState<Tracking[]>([]);
  const [scheduleState, setSchedulingState] = useState<Schedule[]>([]);

  const FORCE_PLATE = Papa.parse('force_plate.csv', {
    complete: function(forceResults) {
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


  const [selectedPlayer, setPlayer] = useState<String>();
  const [playerForceData, setPlayerForceData] = useState<Force[]>([]);
  const [playerTrackingData, setPlayerTrackingData] = useState<Tracking[]>([]);

  const [selectedDataType, setDataType] = useState<DataType>(DataType.ForcePlate);
  const [selectedGranularity, setGranularity] = useState<Granularity>(Granularity.Daily);


  // Use Effect so that any time a new player or data type is selected, we'll filter to the players data
  useEffect(() => {
    if (selectedPlayer || selectedDataType) { 
      setPlayerForceData(forceState.filter((player) => player["Player"] === selectedPlayer));
      setPlayerTrackingData(trackingState.filter((player) => player["Player"] === selectedPlayer));
    }
  }, [selectedPlayer, selectedDataType]); 



  return (
    <div className="App">
      <div className="nav-bar-container">
        <img src={logo} className="memphis-logo" alt="logo" />
      </div>

      <div className="roster">
        <select
            className="custom-select"
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

        {selectedPlayer !=null && 
        <>
          <select
            onChange={(e) => {
              setDataType(e.target.value as DataType)
            }}
          >
            <option disabled selected>--Select Data--</option>
            <option value={DataType.ForcePlate}>Force Plate</option>
            <option value={DataType.Tracking}>Tracking</option>
          </select>
        </>
        }

        {selectedPlayer != null && 
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

      <div className="player-data">
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
            // When a player is selected, pass through to the components the filtered
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

