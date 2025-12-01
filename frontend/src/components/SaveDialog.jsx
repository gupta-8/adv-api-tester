import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SaveDialog({ open, onOpenChange, onSave }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
      setName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
          <DialogDescription>
            Save this request to your collection for easy access later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Get User Profile"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-muted/30 border-white/10 focus-visible:ring-primary/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 hover:bg-white/5">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90">
            Save Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
