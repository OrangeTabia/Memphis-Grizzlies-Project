import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { Tracking, Granularity, Schedule } from '../App';
import { groupByWeek, groupByMonth, orderDates } from '../Utils';

interface TrackingProps {
    trackingData: Tracking[],
    selectedGranularity: Granularity,
    schedule: Schedule[],
}

interface DataProps {
    data: Tracking[],
    granularity: Granularity
}

// function to properly display granulated data
function consolidateTrackingData({
    data, 
    granularity
}: DataProps) { 

    switch (granularity) { 
        case Granularity.Daily: 
            return data;
        case Granularity.Weekly: 
            const weeklyData = groupByWeek(data);
            const weeklyAggregation = Object.keys(weeklyData).map((weekStart) => {
                const weeksData = weeklyData[weekStart]; // array of that week's info
                return {
                    Date: weekStart, 
                    High_Accel: weeksData.reduce((total: number, obj: Tracking) => total + parseFloat(obj.High_Accel), 0) / weeksData.length,
                    High_Decel: weeksData.reduce((total: number, obj: Tracking) => total + parseFloat(obj.High_Decel), 0) / weeksData.length,
                    Distance: weeksData.reduce((total: number, obj: Tracking) => total + parseFloat(obj.Distance), 0) / weeksData.length,
                }
            });
            return weeklyAggregation;
        case Granularity.Monthly: 
            const monthlyData = groupByMonth(data);
            const monthlyAggregation = Object.keys(monthlyData).map((monthStart) => {
                const monthsData = monthlyData[monthStart];
                return {
                    Date: monthStart,
                    High_Accel: monthsData.reduce((total: number, obj: Tracking) => total + parseFloat(obj.High_Accel), 0) / monthsData.length,
                    High_Decel: monthsData.reduce((total: number, obj: Tracking) => total + parseFloat(obj.High_Decel), 0) / monthsData.length,
                    Distance: monthsData.reduce((total: number, obj: Tracking) => total + parseFloat(obj.Distance), 0) / monthsData.length,
                }
            });
            return monthlyAggregation;
        
        default: 
            return data;
    }
}

function TrackingFunc({
    trackingData,
    selectedGranularity,
    schedule
}: TrackingProps) {
    
    // orders trackingData by date
    trackingData.sort(orderDates);

    // these 2 lines filters the trackingData to use for the graphs
    const acceleration = trackingData.filter((player) => player.High_Accel);
    // const deceleration = trackingData.filter((player) => player.High_Decel);
    const distance = trackingData.filter((player) => player.Distance);


    return (
        <>
            <div className="tracking-data">
                <h1>Tracking Data</h1>
                <div className="linebreak"></div>
                <h2>Acceleration and Deceleration</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        width={1000}
                        height={400}
                        data={consolidateTrackingData({data: acceleration, granularity: selectedGranularity})}
                        syncId="anyId"
                    >
                        <CartesianGrid fill="white"/>
                        <XAxis dataKey="Date" stroke="white" fontSize={13}/>
                        <YAxis domain={[0, 60]} stroke="white" label={{ value: "NEWTONS", angle: -90, position: "insideLeft", fill: "#FFBB22"}} fontSize={14} />
                        <Tooltip 
                            labelFormatter={value => {
                                // Find the date in question to then extrapolate the game type
                                const gameType = schedule.find((tracking) => tracking.Date === value)?.Type;
                                if (gameType) {
                                    return `Date: ${value} \n Type: ${gameType}`;
                                } else {
                                    return `Date: ${value}`;
                                }
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="High_Accel" label="test" strokeWidth={2} stroke="#FFBB22" fill="#FFBB22" activeDot={{ r: 8 }}/>
                        <Line type="monotone" dataKey="High_Decel" strokeWidth={2} stroke="#5D76A9" fill="#5D76A9" activeDot={{ r: 8}}/>
                    </LineChart>
                </ResponsiveContainer>

                <h2>Distance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        width={1000}
                        height={400}
                        data={consolidateTrackingData({data: distance, granularity: selectedGranularity})}
                        syncId="anyId"
                    >
                        <CartesianGrid fill="white"/>
                        <XAxis dataKey="Date" stroke="white" fontSize={13}/>
                        <YAxis stroke="white" label={{ value: "INCHES", angle: -90, position: "insideLeft", fill:"#FFBB22" }} fontSize={14}/>
                        <Tooltip 
                            labelFormatter={value => {
                                // Find the date in question to then extrapolate the game type
                                const gameType = schedule.find((tracking) => tracking.Date === value)?.Type;
                                if (gameType) {
                                    return `Date: ${value} \n Type: ${gameType}`;
                                } else {
                                    return `Date: ${value}`;
                                }
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Distance" strokeWidth={2} stroke="#5D76A9" fill="#5D76A9" activeDot={{ r: 8 }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}

export default TrackingFunc;