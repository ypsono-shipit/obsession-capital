import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import AIPanel from "./AIPanel";
import CommandPalette from "../components/CommandPalette";

interface Props {
  workspace: string;
  onNav: (id: string) => void;
  children: React.ReactNode;
}

export default function AppShell({ workspace, onNav, children }: Props) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0D0D0D]">
      <Sidebar active={workspace} onNav={onNav} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onSearch={() => setPaletteOpen(true)} workspace={workspace} />
        <div className="flex-1 flex min-h-0">
          {children}
          <AIPanel />
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNav={id => { onNav(id); setPaletteOpen(false); }} />
    </div>
  );
}
