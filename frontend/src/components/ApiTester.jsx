import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RequestPanel from './RequestPanel';
import ResponsePanel from './ResponsePanel';
import HistoryDrawer from './HistoryDrawer';
import SaveDialog from './SaveDialog';
import { Play, Save, History, Zap } from 'lucide-react';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API_PROXY = `${BACKEND_URL}/api/proxy`;

export default function ApiTester() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  
  // UI States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Data States
  const [history, setHistory] = useState([]);
  const [savedRequests, setSavedRequests] = useState([]);

  const [request, setRequest] = useState({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    queryParams: [],
    headers: [
        { key: 'Content-Type', value: 'application/json', active: true }
    ],
    body: '',
    auth: { type: 'none', token: '', username: '', password: '' }
  });

  // Load data from local storage on mount
  useEffect(() => {
    const lastRequest = localStorage.getItem('lastRequest');
    const savedHistory = localStorage.getItem('api_history');
    const savedCollection = localStorage.getItem('api_saved');

    if (lastRequest) {
      try {
        const parsed = JSON.parse(lastRequest);
        setRequest(prev => ({ 
          ...prev, 
          ...parsed, 
          auth: parsed.auth || { type: 'none', token: '', username: '', password: '' } 
        }));
      } catch (e) { console.error("Failed to parse saved request", e); }
    }

    if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
    
    if (savedCollection) {
        try { setSavedRequests(JSON.parse(savedCollection)); } catch (e) {}
    }
  }, []);

  // Auto-save last request
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('lastRequest', JSON.stringify(request));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [request]);

  // Persist history/saved whenever they change
  useEffect(() => {
    localStorage.setItem('api_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('api_saved', JSON.stringify(savedRequests));
  }, [savedRequests]);


  const addToHistory = (req, resStatus) => {
    const newItem = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: resStatus,
        // Store snapshot of request params
        queryParams: req.queryParams,
        headers: req.headers,
        body: req.body,
        auth: req.auth
    };
    
    setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50
  };

  const handleSaveRequest = (name) => {
    const newItem = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        name: name,
        method: request.method,
        url: request.url,
        queryParams: request.queryParams,
        headers: request.headers,
        body: request.body,
        auth: request.auth
    };
    setSavedRequests(prev => [newItem, ...prev]);
    toast.success("Request saved to collection");
  };

  const loadRequest = (item) => {
    setRequest(prev => ({
        ...prev,
        method: item.method,
        url: item.url,
        queryParams: item.queryParams || [],
        headers: item.headers || [],
        body: item.body || '',
        auth: item.auth || { type: 'none', token: '', username: '', password: '' }
    }));
    setIsHistoryOpen(false);
    toast.info("Request loaded");
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  const deleteSavedItem = (id) => {
    setSavedRequests(prev => prev.filter(i => i.id !== id));
  };


  const handleSend = async () => {
    if (!request.url) {
      toast.error("URL is required");
      return;
    }

    setLoading(true);
    setResponse(null);

    // Prepare headers
    const headersObj = {};
    request.headers.forEach(h => {
      if (h.active && h.key) headersObj[h.key] = h.value;
    });

    // Handle Auth
    if (request.auth) {
        if (request.auth.type === 'bearer' && request.auth.token) {
            headersObj['Authorization'] = `Bearer ${request.auth.token}`;
        } else if (request.auth.type === 'basic' && (request.auth.username || request.auth.password)) {
            try {
               const credentials = btoa(`${request.auth.username}:${request.auth.password}`);
               headersObj['Authorization'] = `Basic ${credentials}`;
            } catch (e) {
               console.error("Failed to encode basic auth", e);
            }
        }
    }

    // Prepare Query Params
    let finalUrl = request.url;
    const queryParts = request.queryParams
      .filter(p => p.active && p.key)
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    
    if (queryParts) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryParts;
    }

    let status = 0;

    try {
      const res = await fetch(API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: request.method,
          url: finalUrl,
          headers: headersObj,
          body: request.body || null
        })
      });

      const data = await res.json();
      setResponse(data);
      status = data.status;
      
      if (data.status === 0) {
          toast.error("Network Error: " + (data.body?.error || "Unknown"));
      } else if (data.status >= 200 && data.status < 300) {
          toast.success(`Status: ${data.status} OK`);
      } else {
          toast.warning(`Status: ${data.status}`);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to send request via proxy");
      setResponse({
          status: 0,
          body: { error: "Failed to connect to backend proxy" },
          is_json: true
      });
    } finally {
      setLoading(false);
      // Add to history
      addToHistory(request, status);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="h-14 border-b border-white/10 bg-background/80 backdrop-blur-md flex items-center px-4 lg:px-6 justify-between z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20 text-primary">
             <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-foreground/90">Adv. API Tester</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={() => setIsHistoryOpen(true)}
          >
             <History className="h-3.5 w-3.5 mr-2" /> History
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 text-xs font-medium border-white/10 bg-white/5 hover:bg-white/10 hover:text-primary hover:border-primary/30 transition-all"
            onClick={() => setIsSaveDialogOpen(true)}
          >
             <Save className="h-3.5 w-3.5 mr-2" /> Save
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Panel: Request */}
        <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-background relative z-10">
             <RequestPanel 
               request={request} 
               setRequest={setRequest} 
               onSend={handleSend} 
               loading={loading}
             />
        </div>

        {/* Right Panel: Response */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/20 relative z-0">
             <ResponsePanel 
               response={response} 
               loading={loading} 
             />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="h-8 border-t border-white/5 bg-background flex items-center px-4 lg:px-6 justify-between text-[10px] text-muted-foreground shrink-0 select-none">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse"></div>
                <span>Ready</span>
            </div>
            <span className="text-white/10">|</span>
            <span className="font-mono opacity-50">{BACKEND_URL}</span>
        </div>
        <div className="flex items-center gap-2 opacity-50">
            <span>v1.0.0</span>
        </div>
      </footer>

      {/* Overlays */}
      <HistoryDrawer 
        open={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen}
        history={history}
        savedRequests={savedRequests}
        onLoad={loadRequest}
        onDeleteHistory={deleteHistoryItem}
        onDeleteSaved={deleteSavedItem}
      />
      
      <SaveDialog 
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveRequest}
      />

    </div>
  );
}
