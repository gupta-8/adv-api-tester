import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, GripVertical } from 'lucide-react';

export default function KeyValueEditor({ items, onChange }) {
  
  const handleAdd = () => {
    onChange([...items, { key: '', value: '', active: true }]);
  };

  const handleRemove = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleUpdate = (index, field, val) => {
    const newItems = [...items];
    newItems[index][field] = val;
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
       <div className="space-y-1">
         {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group animate-in fade-in slide-in-from-left-1 duration-200">
               <div className="cursor-grab text-muted-foreground/20 hover:text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
               </div>
               <Checkbox 
                  checked={item.active} 
                  onCheckedChange={(checked) => handleUpdate(idx, 'active', checked)}
                  className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
               />
               <Input 
                  placeholder="Key" 
                  value={item.key}
                  onChange={(e) => handleUpdate(idx, 'key', e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent border-white/10 focus:border-primary/50 rounded-none px-2 font-mono text-xs h-8 focus-visible:ring-0"
               />
               <Input 
                  placeholder="Value" 
                  value={item.value}
                  onChange={(e) => handleUpdate(idx, 'value', e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent border-white/10 focus:border-primary/50 rounded-none px-2 font-mono text-xs h-8 focus-visible:ring-0"
               />
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(idx)}
               >
                   <Trash2 className="h-3 w-3" />
               </Button>
            </div>
         ))}
       </div>
       
       <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAdd}
          className="w-full border-dashed border-white/10 hover:bg-white/5 text-muted-foreground text-xs h-8 mt-4"
       >
          <Plus className="h-3 w-3 mr-2" /> Add Item
       </Button>
    </div>
  );
}
