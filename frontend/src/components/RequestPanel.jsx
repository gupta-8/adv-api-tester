import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Loader2, Plus, Trash2, Lock } from 'lucide-react';
import KeyValueEditor from './KeyValueEditor';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function RequestPanel({ request, setRequest, onSend, loading }) {
  const [activeTab, setActiveTab] = useState('params');

  const updateField = (field, value) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const updateAuth = (field, value) => {
    setRequest(prev => ({ 
      ...prev, 
      auth: { ...(prev.auth || {}), [field]: value } 
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* URL Bar Section */}
      <div className="p-4 lg:p-5 border-b border-white/5 bg-background/40 backdrop-blur-sm shrink-0">
        <div className="flex gap-3 h-10">
          <Select 
            value={request.method} 
            onValueChange={(val) => updateField('method', val)}
          >
            <SelectTrigger className="w-[100px] h-full font-bold bg-muted/30 border-white/10 text-foreground focus:ring-0 focus:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10 shadow-xl">
              {METHODS.map(m => (
                <SelectItem key={m} value={m} className="font-mono text-xs cursor-pointer hover:bg-primary/10 focus:bg-primary/10 py-2">
                    <span className={cn(
                        "font-bold",
                        m === 'GET' ? 'text-blue-400' :
                        m === 'POST' ? 'text-green-400' :
                        m === 'DELETE' ? 'text-red-400' :
                        m === 'PUT' ? 'text-orange-400' : 'text-foreground'
                    )}>{m}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex-1 relative">
            <Input 
              value={request.url}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="Enter request URL..."
              className="h-full font-mono text-sm bg-muted/30 border-white/10 focus-visible:ring-0 focus-visible:border-primary/50 pl-3 transition-all placeholder:text-muted-foreground/40"
            />
          </div>

          <Button 
            onClick={onSend} 
            disabled={loading}
            className="h-full px-6 bg-primary hover:bg-primary/90 text-black font-bold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 mr-2 fill-black" /> Send</>}
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 lg:px-5 pt-2 border-b border-white/5 shrink-0">
            <TabsList className="bg-transparent h-auto p-0 gap-6 justify-start w-full">
              {['Params', 'Headers', 'Body', 'Auth'].map(tab => (
                 <TabsTrigger 
                   key={tab}
                   value={tab.toLowerCase()}
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 text-[11px] uppercase tracking-widest font-semibold transition-colors hover:text-foreground/80 data-[state=active]:bg-transparent"
                 >
                   {tab}
                   {tab === 'Params' && request.queryParams.length > 0 && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary/80"></span>}
                   {tab === 'Headers' && request.headers.length > 0 && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary/80"></span>}
                   {tab === 'Auth' && request.auth?.type && request.auth.type !== 'none' && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary/80"></span>}
                 </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto bg-background/20 relative">
            {/* We ensure only the active content is rendered or displayed to avoid stacking issues */}
            
            <TabsContent value="params" className={cn("m-0 h-full p-4 lg:p-5 outline-none", activeTab !== 'params' && "hidden")}>
               <div className="space-y-4 max-w-3xl">
                 <div className="flex items-center justify-between pb-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Query Parameters</h3>
                 </div>
                 <KeyValueEditor 
                   items={request.queryParams}
                   onChange={(items) => updateField('queryParams', items)}
                 />
               </div>
            </TabsContent>
            
            <TabsContent value="headers" className={cn("m-0 h-full p-4 lg:p-5 outline-none", activeTab !== 'headers' && "hidden")}>
               <div className="space-y-4 max-w-3xl">
                 <div className="flex items-center justify-between pb-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Request Headers</h3>
                 </div>
                 <KeyValueEditor 
                   items={request.headers}
                   onChange={(items) => updateField('headers', items)}
                 />
               </div>
            </TabsContent>

            <TabsContent value="body" className={cn("m-0 h-full flex flex-col p-4 lg:p-5 outline-none", activeTab !== 'body' && "hidden")}>
               <div className="flex items-center justify-between mb-3 shrink-0">
                 <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">JSON Body</h3>
                 <Button 
                    variant="ghost" 
                    size="xs" 
                    className="h-6 text-[10px] text-primary/80 hover:text-primary hover:bg-primary/10 font-medium"
                    onClick={() => {
                        try {
                            const formatted = JSON.stringify(JSON.parse(request.body), null, 2);
                            updateField('body', formatted);
                        } catch (e) {
                            // ignore
                        }
                    }}
                 >
                    Beautify JSON
                 </Button>
               </div>
               <div className="flex-1 relative border border-white/10 rounded-lg overflow-hidden bg-black/40 shadow-inner">
                  <Textarea 
                     value={request.body}
                     onChange={(e) => updateField('body', e.target.value)}
                     placeholder='{ "key": "value" }'
                     className="w-full h-full resize-none border-0 rounded-none bg-transparent font-mono text-sm p-4 focus-visible:ring-0 leading-relaxed text-blue-100/90 placeholder:text-white/10"
                     spellCheck={false}
                  />
               </div>
               <p className="text-[10px] text-muted-foreground mt-2 pl-1">Content-Type: application/json implied</p>
            </TabsContent>

             <TabsContent value="auth" className={cn("m-0 p-4 lg:p-5 outline-none h-auto block", activeTab !== 'auth' && "hidden")}>
                 <div className="max-w-xl space-y-6 w-full">
                    <div className="space-y-3">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Authentication Type</h3>
                        <Select 
                            value={request.auth?.type || 'none'} 
                            onValueChange={(val) => updateAuth('type', val)}
                        >
                            <SelectTrigger className="w-full bg-muted/30 border-white/10 text-foreground focus:ring-0 focus:border-primary/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-white/10">
                                <SelectItem value="none">No Auth</SelectItem>
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                                <SelectItem value="basic">Basic Auth</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {request.auth?.type === 'bearer' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                             <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Token</h3>
                             <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <Lock className="h-4 w-4 text-muted-foreground/50" />
                                 </div>
                                 <Input 
                                    value={request.auth.token || ''}
                                    onChange={(e) => updateAuth('token', e.target.value)}
                                    placeholder="Enter your bearer token"
                                    type="password"
                                    className="bg-muted/30 border-white/10 pl-9 focus-visible:ring-0 focus-visible:border-primary/50"
                                 />
                             </div>
                             <p className="text-[10px] text-muted-foreground">This will be added as an Authorization: Bearer header.</p>
                        </div>
                    )}

                    {request.auth?.type === 'basic' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-3">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</h3>
                                <Input 
                                    value={request.auth.username || ''}
                                    onChange={(e) => updateAuth('username', e.target.value)}
                                    placeholder="Username"
                                    className="bg-muted/30 border-white/10 focus-visible:ring-0 focus-visible:border-primary/50"
                                />
                            </div>
                             <div className="space-y-3">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</h3>
                                <Input 
                                    value={request.auth.password || ''}
                                    onChange={(e) => updateAuth('password', e.target.value)}
                                    placeholder="Password"
                                    type="password"
                                    className="bg-muted/30 border-white/10 focus-visible:ring-0 focus-visible:border-primary/50"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Credentials will be Base64 encoded and added as an Authorization: Basic header.</p>
                        </div>
                    )}
                 </div>
             </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
