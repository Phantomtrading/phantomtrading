// TodoList.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export const TodoList: React.FC = () => {
  const [items, setItems] = useState([
    { text: 'Design a nice theme', done: false },
    { text: 'Make it responsive', done: true },
  ]);
  const [newText, setNewText] = useState('');

  const addItem = () => {
    if (!newText) return; 
    setItems([...items, { text: newText, done: false }]);
    setNewText('');
  };

  return (
    <Card>
      <CardHeader><CardTitle>To-Do List</CardTitle></CardHeader>
      <CardContent className="space-y-2 py-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() =>
                setItems(items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it))
              }
            />
            <span className={item.done ? 'line-through text-muted-foreground' : ''}>
              {item.text}
            </span>
          </div>
        ))}
        <div className="flex space-x-2">
          <Input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Add new…"
          />
          <Button size="sm" onClick={addItem}>Add</Button>
        </div>
      </CardContent>
    </Card>
  );
};
