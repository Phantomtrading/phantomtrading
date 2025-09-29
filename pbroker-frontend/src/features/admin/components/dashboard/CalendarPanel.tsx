// CalendarPanel.tsx
import React from 'react';
import Calendar from 'react-calendar';
import { Card,  CardContent } from '../../../../components/ui/card';

export const CalendarPanel: React.FC = () => (
  
    <Card className="w-full h-full bg-white shadow-md rounded-lg overflow-hidden">
      {/* <CardHeader><CardTitle>Calendar</CardTitle></CardHeader> */}
      <CardContent>
        <Calendar  />
      </CardContent>
    </Card>
  
);
