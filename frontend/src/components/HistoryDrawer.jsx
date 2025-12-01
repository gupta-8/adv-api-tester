import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, Bookmark, ChevronRight, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

export default function HistoryDrawer({ 
  open, 
  onOpenChange, 
  history, 
  savedRequests, 
  onLoad, 
  onDeleteHistory, 
  onDeleteSaved 
}) {
  const [search, setSearch] = useState('');

  const filterItems = (items) => {
    if (!search) return items;
    return items.filter(item => 
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      (item.name && item.name.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const MethodBadge = ({ method }) => {
    const colors = {
      GET: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      POST: 'text-green-400 bg-green-400/10 border-green-400/20',
      PUT: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      DELETE: 'text-red-400 bg-red-400/10 border-red-400/20',
      PATCH: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    };
    return (
      <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", colors[method] || 'text-gray-400')}>
        {method}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    if (!status) return null;
    const color = status >= 200 && status < 300 ? 'text-green-400' :
                  status >= 400 ? 'text-red-400' : 'text-yellow-400';
    return <span className={cn("text-[10px] font-mono ml-2", color)}>{status}</span>;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-xl border-l border-white/10 flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4" /> Request History
          </SheetTitle>
          <div className="pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-9 bg-muted/30 border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="history" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-2 border-b border-white/5">
            <TabsList className="bg-transparent w-full justify-start p-0 h-auto gap-6">
              <TabsTrigger 
                value="history" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-2 text-xs uppercase tracking-wider font-semibold bg-transparent data-[state=active]:bg-transparent transition-all"
              >
                History ({history.length})
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-2 text-xs uppercase tracking-wider font-semibold bg-transparent data-[state=active]:bg-transparent transition-all"
              >
                Saved ({savedRequests.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="flex-1 min-h-0 m-0 relative">
            <ScrollArea className="h-full">
              <div className="flex flex-col p-4 gap-2">
                {filterItems(history).length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground/50 text-sm">
                    No history yet
                  </div>
                ) : (
                  filterItems(history).map((item) => (
                    <div 
                      key={item.id}
                      className="group flex flex-col gap-2 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/20 transition-all cursor-pointer"
                      onClick={() => onLoad(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <MethodBadge method={item.method} />
                          <span className="text-xs text-muted-foreground truncate font-mono" title={item.url}>
                            {item.url}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHistory(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                         <div className="flex items-center">
                            <span className="opacity-70">{new Date(item.timestamp).toLocaleString()}</span>
                            <StatusBadge status={item.status} />
                         </div>
                         <div className="flex items-center gap-1 text-primary/0 group-hover:text-primary/80 transition-colors">
                            Load <ChevronRight className="h-3 w-3" />
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="saved" className="flex-1 min-h-0 m-0 relative">
            <ScrollArea className="h-full">
              <div className="flex flex-col p-4 gap-2">
                {filterItems(savedRequests).length === 0 ? (
                   <div className="text-center py-10 text-muted-foreground/50 text-sm">
                     No saved requests
                   </div>
                ) : (
                  filterItems(savedRequests).map((item) => (
                    <div 
                      key={item.id}
                      className="group flex flex-col gap-2 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/20 transition-all cursor-pointer"
                      onClick={() => onLoad(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-sm text-foreground/90">
                           <Bookmark className="h-3 w-3 text-primary" />
                           {item.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSaved(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MethodBadge method={item.method} />
                        <span className="text-xs text-muted-foreground truncate font-mono flex-1" title={item.url}>
                          {item.url}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
