import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, 
} from 'recharts';
// import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface AreaDataItem {
  month: string;
  value1: number;
  value2: number;
}

interface LineDataItem {
  quarter: string;
  sales: number;
}

const areaData: AreaDataItem[] = [
  { month: 'Jan', value1: 4000, value2: 2400 },
  { month: 'Feb', value1: 3000, value2: 1398 },
  { month: 'Mar', value1: 2000, value2: 9800 },
  { month: 'Apr', value1: 2780, value2: 3908 },
  { month: 'May', value1: 1890, value2: 4800 },
  { month: 'Jun', value1: 2390, value2: 3800 },
];

const lineData: LineDataItem[] = [
  { quarter: 'Q1', sales: 4000 },
  { quarter: 'Q2', sales: 3000 },
  { quarter: 'Q3', sales: 2000 },
  { quarter: 'Q4', sales: 2780 },
];



export const ChartsSection: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
    {/* Total Deposit (Area Chart) */}
    <Card className="col-span-2">
      <CardHeader><CardTitle>Total Deposit</CardTitle></CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={areaData}>
            <XAxis dataKey="month"/>
            <YAxis/>
            <Tooltip/>
            <Area type="monotone" dataKey="value1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="value2" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Visitors Map */}
    <Card>
      <CardHeader><CardTitle>Visitors</CardTitle></CardHeader>
      <CardContent className="h-48">
        {/* <ComposableMap projection="geoAlbersUsa">
          <Geographies geography="/us-states.json">
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography key={geo.rsmKey} geography={geo} fill="#ECEFF1" stroke="#607D8B"/>
              ))
            }
          </Geographies>
        </ComposableMap> */}
      </CardContent>
    </Card>

    {/* Sales Graph (Line Chart) */}
    <Card className="col-span-2 lg:col-span-3">
      <CardHeader><CardTitle>Sales Graph</CardTitle></CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <XAxis dataKey="quarter"/>
            <YAxis/>
            <Tooltip/>
            <Line type="monotone" dataKey="sales" stroke="#8884d8"/>
          </LineChart>
        </ResponsiveContainer>
        
      </CardContent>
    </Card>
  </div>
);
