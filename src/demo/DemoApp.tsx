import React, { useState } from "react";
import AppShell from "./layout/AppShell";
import Dashboard from "./workspaces/Dashboard";
import Insights from "./workspaces/Insights";
import Inventory from "./workspaces/Inventory";
import Orders from "./workspaces/Orders";
import Menu from "./workspaces/Menu";
import Finance from "./workspaces/Finance";
import Heatmap from "./workspaces/Heatmap";
import Growth from "./workspaces/Growth";

type Workspace = "dashboard" | "insights" | "inventory" | "orders" | "menu" | "finance" | "heatmap" | "growth";

export default function DemoApp() {
  const [workspace, setWorkspace] = useState<Workspace>("dashboard");

  const renderWorkspace = () => {
    switch (workspace) {
      case "dashboard":  return <Dashboard onNav={setWorkspace} />;
      case "insights":   return <Insights />;
      case "inventory":  return <Inventory />;
      case "orders":     return <Orders />;
      case "menu":       return <Menu />;
      case "finance":    return <Finance />;
      case "heatmap":    return <Heatmap />;
      case "growth":     return <Growth />;
    }
  };

  return (
    <AppShell workspace={workspace} onNav={(id) => setWorkspace(id as Workspace)}>
      {renderWorkspace()}
    </AppShell>
  );
}
