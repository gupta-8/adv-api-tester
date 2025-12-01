import { useEffect } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import ApiTester from "@/components/ApiTester";

function App() {
  useEffect(() => {
    // Set dark mode by default for this theme
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <ApiTester />
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;
