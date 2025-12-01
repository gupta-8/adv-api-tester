import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Download, Maximize2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ResponsePanel({ response, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (response?.body) {
       const text = typeof response.body === 'object' 
         ? JSON.stringify(response.body, null, 2) 
         : response.body;
       navigator.clipboard.writeText(text);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-3 bg-black/20">
            <div className="relative">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
            </div>
            <p className="text-xs font-mono tracking-wide animate-pulse">Processing Request...</p>
        </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-2 select-none bg-black/20">
        <p className="text-sm font-mono">Enter a URL and click Send to view the response</p>
      </div>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isError = response.status >= 400;

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Status Bar */}
      <div className="h-12 lg:h-14 border-b border-white/5 bg-black/10 flex items-center px-4 lg:px-5 justify-between shrink-0">
         <div className="flex items-center gap-4">
            <Badge variant="outline" className={cn(
                "h-6 px-2.5 font-mono text-xs font-bold border-0 rounded-md",
                isSuccess ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20" :
                isError ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20" :
                "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
            )}>
                {response.status} {response.status === 200 ? 'OK' : ''}
            </Badge>
            <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
                <span><span className="text-white/30">Time:</span> <span className="text-foreground/80">{response.time_ms}ms</span></span>
                <span><span className="text-white/30">Size:</span> <span className="text-foreground/80">{(response.size_bytes / 1024).toFixed(2)} KB</span></span>
            </div>
         </div>
         
         <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white hover:bg-white/5" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
             </Button>
         </div>
      </div>

      {/* Response Content */}
      <Tabs defaultValue="pretty" className="flex-1 flex flex-col overflow-hidden">
         <div className="px-4 lg:px-5 border-b border-white/5 bg-black/5 shrink-0">
            <TabsList className="bg-transparent h-9 p-0 gap-6 justify-start w-full">
                <TabsTrigger value="pretty" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 text-[11px] uppercase tracking-widest font-semibold transition-colors hover:text-foreground/80 data-[state=active]:bg-transparent">Pretty</TabsTrigger>
                <TabsTrigger value="raw" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 text-[11px] uppercase tracking-widest font-semibold transition-colors hover:text-foreground/80 data-[state=active]:bg-transparent">Raw</TabsTrigger>
                <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 text-[11px] uppercase tracking-widest font-semibold transition-colors hover:text-foreground/80 data-[state=active]:bg-transparent">Headers</TabsTrigger>
            </TabsList>
         </div>

         <div className="flex-1 overflow-auto bg-[#0d1117]/50 relative font-mono text-sm group">
             <TabsContent value="pretty" className="m-0 min-h-full p-4 lg:p-5 outline-none">
                 {response.is_json ? (
                    <pre className="text-blue-100/90 leading-relaxed text-[13px]" style={{ tabSize: 2 }}>
                        {JSON.stringify(response.body, null, 2)}
                    </pre>
                 ) : (
                    <div className="text-muted-foreground/50 p-4 italic text-xs">Response is not JSON. Switch to Raw view.</div>
                 )}
             </TabsContent>
             
             <TabsContent value="raw" className="m-0 min-h-full p-4 lg:p-5 outline-none">
                 <pre className="text-green-100/80 whitespace-pre-wrap break-all text-[13px]">
                    {typeof response.body === 'string' ? response.body : JSON.stringify(response.body)}
                 </pre>
             </TabsContent>

             <TabsContent value="headers" className="m-0 min-h-full p-0 outline-none">
                <div className="divide-y divide-white/5 text-[13px]">
                    {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} className="flex px-4 lg:px-6 py-2.5 hover:bg-white/5 transition-colors">
                            <div className="w-1/3 text-muted-foreground truncate pr-4 select-none" title={k}>{k}</div>
                            <div className="flex-1 text-blue-200/90 truncate font-medium" title={v}>{v}</div>
                        </div>
                    ))}
                </div>
             </TabsContent>
         </div>
      </Tabs>
    </div>
  );
}
