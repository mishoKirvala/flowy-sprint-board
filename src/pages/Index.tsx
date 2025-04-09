
import React, { useState } from 'react';
import { KanbanProvider } from '@/context/KanbanContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BacklogView from '@/components/BacklogView';
import SprintView from '@/components/SprintView';
import { ArrowLeft } from 'lucide-react';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('backlog');

  return (
    <KanbanProvider>
      <div className="min-h-screen bg-slate-50 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Flowy Sprint Board</h1>
          <p className="text-slate-500">Manage your backlog and sprint tasks in one place</p>
        </header>
        
        <Tabs 
          defaultValue="backlog" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="px-6 pt-6 pb-0">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="backlog" className="rounded">Backlog</TabsTrigger>
              <TabsTrigger value="sprint" className="rounded">Sprint Board</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            <TabsContent value="backlog" className="m-0">
              <BacklogView />
            </TabsContent>
            <TabsContent value="sprint" className="m-0">
              <SprintView />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </KanbanProvider>
  );
};

export default Index;
