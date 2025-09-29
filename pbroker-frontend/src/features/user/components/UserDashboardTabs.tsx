import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

const UserDashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="tasks" className="w-full mt-8">
      <TabsList>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">
        {/* Placeholder for Tasks content */}
        <div className="p-6 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Your Active Tasks</h3>
          <p className="text-muted-foreground">List of active tasks will go here.</p>
        </div>
      </TabsContent>
      <TabsContent value="completed">
        {/* Placeholder for Completed Tasks content */}
        <div className="p-6 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Your Completed Tasks</h3>
          <p className="text-muted-foreground">List of completed tasks will go here.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default UserDashboardTabs; 