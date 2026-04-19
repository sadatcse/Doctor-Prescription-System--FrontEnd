import React from "react";
import { WifiOff, RefreshCw, Wifi, Info } from "lucide-react";

const tips = [
  { icon: Wifi,       text: "Check your Wi-Fi or ethernet connection" },
  { icon: RefreshCw,  text: "Refresh the page once reconnected" },
  { icon: Info,       text: "Contact IT if the issue persists" },
];

const OfflineWarning = ({ onRetry }) => (
  <div className="relative flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center overflow-hidden font-primary">
    
    {/* Subtle Background Glow for Modern Depth */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-foreground/5 blur-[100px] rounded-full pointer-events-none" />

    <div className="relative z-10 flex flex-col items-center">
      
      {/* Pulsing icon - Modernized with squircle shape & softer shadows */}
      <div className="relative mb-8 flex items-center justify-center">
        <span className="absolute inline-flex h-32 w-32 animate-ping rounded-full bg-destructive/10 opacity-50 duration-1000" />
        <span className="absolute inline-flex h-24 w-24 animate-ping rounded-full bg-destructive/20 opacity-40 delay-150 duration-1000" />
        
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-xl backdrop-blur-xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-muted/50 to-transparent" />
          <WifiOff className="h-8 w-8 text-muted-foreground relative z-20" strokeWidth={1.5} />
        </div>
      </div>

      {/* Status pill - Sleek & precise */}
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-destructive backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
        </span>
        CONNECTION LOST
      </span>

      {/* Heading + body */}
      <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground font-secondary">
        You're currently offline
      </h2>
      <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground">
        Role permissions can't be viewed or modified without an active internet connection. Please restore your connection to continue.
      </p>

      {/* Actions - Elevated interactive buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <button
          onClick={onRetry}
          className="group inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-all hover:-translate-y-0.5 hover:bg-foreground/90 active:scale-95 active:translate-y-0"
        >
          <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
          Try again
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-muted active:scale-95">
          Learn more
        </button>
      </div>

      {/* Tips - Glassmorphism Cards */}
      <div className="w-full max-w-sm space-y-3">
        {tips.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/40 p-3 text-left shadow-sm backdrop-blur-md transition-colors hover:bg-muted/80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-border">
              <Icon className="h-4 w-4 text-foreground/70" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {text}
            </span>
          </div>
        ))}
      </div>
      
    </div>
  </div>
);

export default OfflineWarning;