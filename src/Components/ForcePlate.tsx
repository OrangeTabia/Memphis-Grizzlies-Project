import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Force, Granularity, Schedule } from '../App';
import { groupByWeek, groupByMonth, orderDates } from '../Utils';

// used to display force data, granularity, 
// and if the data on that day is a game or practice (from Schedule)
interface ForcePlateProps { 
    forceData: Force[],
    selectedGranularity: Granularity,
    schedule: Schedule[],
}

// used to display the granularity of the forceplate data
interface DataProps {
    data: Force[],
    granularity: Granularity
}

// function to properly display granulated data (essentially a helper function)
function consolidateForceData({
    data, 
    granularity
}: DataProps) { 

    switch (granularity) { 
        
        case Granularity.Daily: 
            return data;
        
        case Granularity.Weekly: 
            // weeklyData is an object where the key is a week start date
            // and the values are an array of items for that week
            const weeklyData = groupByWeek(data);
            // extracts the keys of weeklyData aka the start dates of each week
            const weeklyAggregation = Object.keys(weeklyData).map((weekStart) => {
                // weeksData is an array of objects for that specific week's data 
                const weeksData = weeklyData[weekStart]; 
                return {
                    Date: weekStart, 
                    // these 3 lines of reduce functions get us the average data 
                    // for con force, ecc force, and jump height for that week
                    Peak_Concentric_Force: weeksData.reduce((total: number, obj: Force) => total + parseFloat(obj.Peak_Concentric_Force), 0) / weeksData.length,
                    Peak_Eccentric_Force: weeksData.reduce((total: number, obj: Force) => total + parseFloat(obj.Peak_Eccentric_Force), 0) / weeksData.length,
                    Jump_Height: weeksData.reduce((total: number, obj: Force) => total + parseFloat(obj.Jump_Height), 0) / weeksData.length,
                }
            });
            return weeklyAggregation;

        case Granularity.Monthly: 
            // monthly data is an object where the key is the month and year (MM-YYYY)
            // and the values are an array of items for that month
            const monthlyData = groupByMonth(data);
            const monthlyAggregation = Object.keys(monthlyData).map((monthStart) => {
                // monthsData is an array of objects for that specific month
                const monthsData = monthlyData[monthStart];
                return {
                    // these 3 lines of reduce functions get us the average data 
                    // for con force, ecc force, and jump height for that specific month
                    Date: monthStart,
                    Peak_Concentric_Force: monthsData.reduce((total: number, obj: Force) => total + parseFloat(obj.Peak_Concentric_Force), 0) / monthsData.length,
                    Peak_Eccentric_Force: monthsData.reduce((total: number, obj: Force) => total + parseFloat(obj.Peak_Eccentric_Force), 0) / monthsData.length,
                    Jump_Height: monthsData.reduce((total: number, obj: Force) => total + parseFloat(obj.Jump_Height), 0) / monthsData.length,
                }
            });
            return monthlyAggregation;
        
        default: 
            return data;
    }
}

function ForcePlate({
    forceData,
    selectedGranularity,
    schedule
}: ForcePlateProps) {

    // orders forceData by date
    forceData.sort(orderDates);
    
    // these 4 lines of code filters out the forceData between right and left legs, 
    // force, and jump height to be used for the graphs
    const rightLegForce = forceData.filter((leg) => leg['Leg'] === 'Right');
    const leftLegForce = forceData.filter((leg) => leg['Leg'] === 'Left');
    const rightJumpHeight = forceData.filter((jump) => jump['Leg'] === 'Right' && jump.Jump_Height);
    const leftJumpHeight = forceData.filter((jump) => jump['Leg'] === 'Left' && jump.Jump_Height);


    return (
        <>
            <h1>Force Plate Data</h1>
            <div className="linebreak"></div>
            <h2>Peak Force - Right Leg</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    width={1000}
                    height={300}
                    data={consolidateForceData({data: rightLegForce, granularity: selectedGranularity})}
                    // syncId="anyId"
                >
                    <CartesianGrid fill="white"/>
                    <XAxis dataKey="Date" stroke="white" fontSize={13}/>
                    <YAxis stroke="white" label={{ value: "NEWTONS", angle: -90, position: "insideLeft", fill: "#FFBB22"}} fontSize={14}/>
                    <Tooltip 
                        labelFormatter={value => {
                            // find the date in question to then extrapolate the game type
                            const gameType = schedule.find((force) => force.Date === value)?.Type;
                            if (gameType) {
                                return `Date: ${value} \n Type: ${gameType}`;
                            } else {
                                return `Date: ${value}`;
                            }
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Peak_Eccentric_Force" stroke="#FFBB22" strokeWidth={2} fill="#FFBB22" activeDot={{ r: 8 }}/>
                    <Line type="monotone" dataKey="Peak_Concentric_Force" stroke="#5D76A9" strokeWidth={2} fill="#5D76A9" activeDot={{ r: 8}}/>
                </LineChart>
            </ResponsiveContainer>
            <h2>Jump Height - Right Leg</h2>
            <ResponsiveContainer width="100%" height={300} className="jumpheight-right">
                <LineChart
                    width={1000}
                    height={300}
                    data={consolidateForceData({data: rightJumpHeight, granularity: selectedGranularity})}
                    // syncId="anyId"
                >
                    <CartesianGrid fill="white"/>
                    <XAxis dataKey="Date" stroke="white" fontSize={13}/>
                    <YAxis stroke="white" label={{ value: "NEWTONS", angle: -90, position: "insideLeft", fill: "#FFBB22"}} fontSize={14}/>
                    <Tooltip 
                        labelFormatter={value => {
                            // find the date in question to then extrapolate the game type
                            const gameType = schedule.find((force) => force.Date === value)?.Type;
                            if (gameType) {
                                return `Date: ${value} \n Type: ${gameType}`;
                            } else {
                                return `Date: ${value}`;
                            }
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Jump_Height" stroke="#5D76A9" strokeWidth={2} fill="#5D76A9" activeDot={{ r: 8}}/>
                </LineChart>
            </ResponsiveContainer>

            <div className="linebreak"></div>
            
            <h2>Peak Force - Left Leg</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    width={1000}
                    height={300}
                    data={consolidateForceData({data: leftLegForce, granularity: selectedGranularity})}
                    // syncId="anyId"
                >
                    <CartesianGrid fill="white"/>
                    <XAxis dataKey="Date" stroke="white" fontSize={13}/>
                    <YAxis stroke="white" label={{ value: "NEWTONS", angle: -90, position: "insideLeft", fill: "#FFBB22"}} fontSize={14}/>
                    <Tooltip 
                        labelFormatter={value => {
                            // find the date in question to then extrapolate the game type
                            const gameType = schedule.find((force) => force.Date === value)?.Type;
                            if (gameType) {
                                return `Date: ${value} \n Type: ${gameType}`;
                            } else {
                                return `Date: ${value}`;
                            }
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Peak_Eccentric_Force" stroke="#FFBB22" strokeWidth={2} fill="#FFBB22" activeDot={{ r: 8 }}/>
                    <Line type="monotone" dataKey="Peak_Concentric_Force" stroke="#5D76A9" strokeWidth={2} fill="#5D76A9" activeDot={{ r: 8}}/>
                </LineChart>
            </ResponsiveContainer>

            <h2>Jump Height - Left Leg</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    width={1000}
                    height={300}
                    data={consolidateForceData({data: leftJumpHeight, granularity: selectedGranularity})}
                    // syncId="anyId"
                >
                    <CartesianGrid fill="white"/>
                    <XAxis dataKey="Date" stroke="white" fontSize={13}/>
                    <YAxis stroke="white" label={{ value: "NEWTONS", angle: -90, position: "insideLeft", fill: "#FFBB22"}} fontSize={14}/>
                    <Tooltip 
                        labelFormatter={value => {
                            // find the date in question to then extrapolate the game type
                            const gameType = schedule.find((force) => force.Date === value)?.Type;
                            if (gameType) {
                                return `Date: ${value} \n Type: ${gameType}`;
                            } else {
                                return `Date: ${value}`;
                            }
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Jump_Height" stroke="#5D76A9" strokeWidth={2} fill="#5D76A9" activeDot={{ r: 8}}/>
                </LineChart>
            </ResponsiveContainer>
        </>
    )
}

export default ForcePlate;