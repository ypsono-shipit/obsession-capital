import React, { useState } from "react";
import { DailyLog, MetricConfig } from "../types";
import { Plus, Edit2, Check, TrendingUp, Calendar, Info, Activity, ArrowUpRight, ArrowDownRight, Share2, Upload } from "lucide-react";
import * as XLSX from "xlsx";

interface HeatmapProps {
  logs: DailyLog[];
  metric: MetricConfig;
  onSaveLog: (date: string, value: number, note: string) => void;
  onBulkUpdateLogs?: (newLogs: DailyLog[]) => void;
}

export default function Heatmap({ logs, metric, onSaveLog, onBulkUpdateLogs }: HeatmapProps) {
  // Generate relative past days ending on mock system date 2026-06-25
  const generatePastDays = (count: number) => {
    const today = new Date("2026-06-25");
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      days.push(dateString);
    }
    return days;
  };

  // Generate the full year of 2026 starting from December 28, 2025 (preceding Sunday) to January 2, 2027 (succeeding Saturday)
  const generate2026CalendarDays = () => {
    const days = [];
    // Start date is Sunday, Dec 28, 2025 to align 53 weeks (371 days)
    const start = new Date("2025-12-28T00:00:00");
    for (let i = 0; i < 371; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      days.push(`${year}-${month}-${day}`);
    }
    return days;
  };

  const past371Days = generate2026CalendarDays();

  // Group into 53 weeks of 7 days
  const weeks: string[][] = [];
  for (let i = 0; i < 53; i++) {
    weeks.push(past371Days.slice(i * 7, (i + 1) * 7));
  }

  // Find a log by date
  const getLogForDate = (dateStr: string) => {
    return logs.find((l) => l.date === dateStr);
  };

  // Get color intensity class based on value relative to metric goal
  const getColorClass = (dateStr: string) => {
    const log = getLogForDate(dateStr);
    if (!log || log.value === 0) return "bg-neutral-900 border-neutral-800 hover:border-neutral-700";
    
    const val = log.value;
    const goal = metric.weeklyGoal / 7; // Daily target portion
    
    if (val < goal * 0.5) return "bg-emerald-950/40 border-emerald-900/60 text-emerald-300 hover:border-emerald-700";
    if (val < goal) return "bg-emerald-900/60 border-emerald-800 text-emerald-200 hover:border-emerald-600";
    if (val < goal * 1.5) return "bg-emerald-700 border-emerald-600 text-emerald-100 hover:border-emerald-500";
    return "bg-emerald-500 border-emerald-400 text-neutral-950 font-bold hover:border-white";
  };

  // State for selected date in the heatmap
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-25");
  const [logValue, setLogValue] = useState<string>("");
  const [logNote, setLogNote] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calibration and real data onboarding states
  const [backfillVal, setBackfillVal] = useState<string>("100");
  const [calibrationSuccess, setCalibrationSuccess] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Import states
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleClearAllLogs = () => {
    if (onBulkUpdateLogs) {
      onBulkUpdateLogs([]);
      setShowConfirmClear(false);
      setCalibrationSuccess("Data purged. Ready for real inputs.");
      setTimeout(() => setCalibrationSuccess(null), 4000);
    }
  };

  const handleBackfillLogs = () => {
    const val = parseFloat(backfillVal) || 0;
    const filledLogs = past371Days.map((dateStr) => ({
      date: dateStr,
      value: val,
      note: `Baseline historical calibration of average daily earnings (${val})`,
    }));
    if (onBulkUpdateLogs) {
      onBulkUpdateLogs(filledLogs);
      setCalibrationSuccess(`Grid seeded with custom ${val} ${metric.unit}/day baseline.`);
      setTimeout(() => setCalibrationSuccess(null), 4000);
    }
  };

  const handleImportSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error("Could not read file data.");
        
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        if (rows.length < 1) {
          throw new Error("Spreadsheet appears to be empty.");
        }

        // We can inspect the first row for headers.
        const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
        
        let dateColIdx = 0;
        let valColIdx = 1;
        let noteColIdx = 2;
        let hasHeaders = false;

        // Try to identify header index
        const dIdx = headers.findIndex(h => h.includes("date") || h.includes("day") || h.includes("time"));
        const vIdx = headers.findIndex(h => h.includes("value") || h.includes("income") || h.includes("amount") || h.includes("earnings") || h.includes("revenue") || h.includes("metric"));
        const nIdx = headers.findIndex(h => h.includes("note") || h.includes("context") || h.includes("desc") || h.includes("comment") || h.includes("achievement"));

        if (dIdx !== -1 && vIdx !== -1) {
          dateColIdx = dIdx;
          valColIdx = vIdx;
          if (nIdx !== -1) noteColIdx = nIdx;
          hasHeaders = true;
        }

        const startRowIdx = hasHeaders ? 1 : 0;
        const newLogs: DailyLog[] = [];

        for (let i = startRowIdx; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          // Parse Date
          let dateStr = "";
          const rawDate = row[dateColIdx];
          if (!rawDate) continue;

          if (typeof rawDate === "number") {
            // It could be an Excel serial date number
            try {
              const dateObj = XLSX.SSF.parse_date_code(rawDate);
              const m = String(dateObj.m).padStart(2, "0");
              const d = String(dateObj.d).padStart(2, "0");
              dateStr = `${dateObj.y}-${m}-${d}`;
            } catch (e) {
              const dObj = new Date((rawDate - 25569) * 86400 * 1000);
              dateStr = dObj.toISOString().split("T")[0];
            }
          } else {
            const dObj = new Date(String(rawDate).trim());
            if (!isNaN(dObj.getTime())) {
              dateStr = dObj.toISOString().split("T")[0];
            }
          }

          if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            continue; // Invalid date format
          }

          // Parse Value
          const rawVal = row[valColIdx];
          const val = parseFloat(String(rawVal || "0").replace(/[^0-9.-]/g, "")) || 0;

          // Parse Note
          const rawNote = row[noteColIdx] ? String(row[noteColIdx]).trim() : "";

          // Check if date is within past 371 days
          if (past371Days.includes(dateStr)) {
            newLogs.push({
              date: dateStr,
              value: val,
              note: rawNote || `Imported telemetry: logged ${val} ${metric.unit}`
            });
          }
        }

        if (newLogs.length === 0) {
          throw new Error("No valid dates within the past 371 days were found. Please verify dates match standard formats (e.g. YYYY-MM-DD).");
        }

        if (onBulkUpdateLogs) {
          const mergedLogs = [...logs];
          newLogs.forEach((newLog) => {
            const existingIdx = mergedLogs.findIndex(l => l.date === newLog.date);
            if (existingIdx !== -1) {
              mergedLogs[existingIdx] = newLog;
            } else {
              mergedLogs.push(newLog);
            }
          });
          onBulkUpdateLogs(mergedLogs);
          setImportSuccess(`Import complete: successfully integrated ${newLogs.length} entries.`);
          setTimeout(() => setImportSuccess(null), 5000);
        }

      } catch (err: any) {
        setImportError(err.message || "Failed to process Excel/CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const activeLog = getLogForDate(selectedDate);

  const handleCellClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const log = getLogForDate(dateStr);
    if (log) {
      setLogValue(log.value.toString());
      setLogNote(log.note);
      setIsEditing(false);
    } else {
      setLogValue("");
      setLogNote("");
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const val = parseFloat(logValue) || 0;
    onSaveLog(selectedDate, val, logNote);
    setIsEditing(false);
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Stats calculation
  const totalIncomeLogged = logs.reduce((sum, l) => sum + l.value, 0);
  const activeDays = logs.filter(l => l.value > 0).length;

  // Velocity Trend calculation for the last 30 days
  const last30Days = generatePastDays(30);
  const last30Data = last30Days.map((dStr, index) => {
    const log = getLogForDate(dStr);
    return {
      date: dStr,
      value: log ? log.value : 0,
      dayIndex: index,
    };
  });

  const maxVal = Math.max(...last30Data.map(d => d.value), 10);
  const n30 = last30Data.length;

  // Linear regression: y = m*x + c
  const sumX = last30Data.reduce((sum, d) => sum + d.dayIndex, 0);
  const sumY = last30Data.reduce((sum, d) => sum + d.value, 0);
  const avgX = sumX / n30;
  const avgY = sumY / n30;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n30; i++) {
    const x = last30Data[i].dayIndex;
    const y = last30Data[i].value;
    num += (x - avgX) * (y - avgY);
    den += Math.pow(x - avgX, 2);
  }

  const slope = den === 0 ? 0 : num / den;
  const intercept = avgY - slope * avgX;

  const velocityFormatted = slope > 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2);
  let velocityStatus = "Steady Growth";
  let velocityColor = "text-neutral-400";
  let VelocityIcon = TrendingUp;

  if (slope > 0.5) {
    velocityStatus = "Accelerating Velocity";
    velocityColor = "text-emerald-400";
    VelocityIcon = ArrowUpRight;
  } else if (slope < -0.5) {
    velocityStatus = "Decelerating Velocity";
    velocityColor = "text-rose-400";
    VelocityIcon = ArrowDownRight;
  }

  // Generate SVG coordinates for 30-day sparkline
  const svgWidth = 500;
  const svgHeight = 100;
  const padding = { top: 15, right: 15, bottom: 20, left: 40 };

  const getX = (index: number) => {
    return padding.left + (index / (n30 - 1)) * (svgWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return svgHeight - padding.bottom - (val / maxVal) * (svgHeight - padding.top - padding.bottom);
  };

  const pointsStr = last30Data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.value).toFixed(1)}`).join(" ");
  const areaPointsStr = `${getX(0).toFixed(1)},${(svgHeight - padding.bottom).toFixed(1)} ${pointsStr} ${getX(n30 - 1).toFixed(1)},${(svgHeight - padding.bottom).toFixed(1)}`;

  // Trend line points
  const trendStartVal = Math.max(0, intercept);
  const trendEndVal = Math.max(0, slope * (n30 - 1) + intercept);
  const trendStartX = getX(0).toFixed(1);
  const trendStartY = getY(trendStartVal).toFixed(1);
  const trendEndX = getX(n30 - 1).toFixed(1);
  const trendEndY = getY(trendEndVal).toFixed(1);

  const currentStreak = () => {
    let streak = 0;
    const reversedDays = [...past371Days].reverse();
    for (const dStr of reversedDays) {
      const log = getLogForDate(dStr);
      if (log && log.value > 0) {
        streak++;
      } else {
        // Only break if it's not today with 0 logs yet (allow 1 day grace for yesterday)
        if (dStr === reversedDays[0]) continue;
        break;
      }
    }
    return streak;
  };

  const exportAsImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to draw rounded rectangle
    const drawRoundRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fillColor: string,
      strokeColor: string
    ) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
      c.fillStyle = fillColor;
      c.fill();
      c.strokeStyle = strokeColor;
      c.lineWidth = 1;
      c.stroke();
    };

    // Background fill
    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, 1200, 630);

    // Draw background tech grid lines
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 1;
    for (let x = 40; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 610);
      ctx.stroke();
    }
    for (let y = 20; y < 630; y += 40) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(1180, y);
      ctx.stroke();
    }

    // Border box
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 1160, 590);

    // Draw corner brackets
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(15, 30); ctx.lineTo(15, 15); ctx.lineTo(30, 15); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(1170, 15); ctx.lineTo(1185, 15); ctx.lineTo(1185, 30); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(15, 600); ctx.lineTo(15, 615); ctx.lineTo(30, 615); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(1170, 615); ctx.lineTo(1185, 615); ctx.lineTo(1185, 600); ctx.stroke();

    // Top system header text
    ctx.fillStyle = "#666666";
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText("SYSTEM_OS // PULSE MATRIX GENERATOR // V1.0", 40, 45);

    ctx.textAlign = "right";
    ctx.fillText(`EXPORT_HASH: PULSE_${Math.floor(Date.now() / 1000)}`, 1160, 45);

    // Big titles
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(`METRIC PULSE: ${metric.name.toUpperCase()}`, 40, 95);

    ctx.fillStyle = "#10b981";
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillText(`371-DAY (FULL YEAR) SYSTEMATIC OPERATIONAL RECORD // TARGET: ${metric.weeklyGoal} ${metric.unit}/WEEK`, 40, 125);

    // Grid Panel Background
    drawRoundRect(ctx, 40, 155, 730, 390, 0, "#0b0b0b", "#1a1a1a");

    // Grid panel subheader tag
    ctx.fillStyle = "#161616";
    ctx.fillRect(50, 155, 140, 20);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("INPUT_SIGNAL_MATRIX", 120, 169);

    // Month Headers on Canvas (aligned dynamically)
    ctx.fillStyle = "#666666";
    ctx.font = "8px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "left";
    
    const xStart = 85;
    const yStart = 225;
    const colWidth = 12;
    const rowHeight = 12;

    weeks.forEach((week, wIdx) => {
      const firstDay = new Date(week[0] + "T00:00:00");
      const currentMonth = firstDay.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      
      let showMonth = false;
      if (wIdx === 0) {
        showMonth = true;
      } else {
        const prevWeek = weeks[wIdx - 1];
        const prevFirstDay = new Date(prevWeek[0] + "T00:00:00");
        const prevMonth = prevFirstDay.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        if (currentMonth !== prevMonth) {
          showMonth = true;
        }
      }

      if (showMonth) {
        ctx.fillText(currentMonth, xStart + wIdx * colWidth, 205);
      }
    });

    // Day Labels
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.textAlign = "right";
    ctx.font = "8px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    days.forEach((day, idx) => {
      ctx.fillText(day, xStart - 10, yStart + idx * rowHeight + 8);
    });

    // Grid Cells
    weeks.forEach((week, wIdx) => {
      week.forEach((dateStr, dIdx) => {
        const cx = xStart + wIdx * colWidth;
        const cy = yStart + dIdx * rowHeight;

        // Get colors
        const log = logs.find((l) => l.date === dateStr);
        let bg = "#121212";
        let border = "#222222";

        if (log && log.value > 0) {
          const val = log.value;
          const goal = metric.weeklyGoal / 7;
          if (val < goal * 0.5) {
            bg = "#062216";
            border = "#0b4129";
          } else if (val < goal) {
            bg = "#053d26";
            border = "#0e6440";
          } else if (val < goal * 1.5) {
            bg = "#0c7a4e";
            border = "#10b981";
          } else {
            bg = "#10b981";
            border = "#6ee7b7";
          }
        }

        drawRoundRect(ctx, cx, cy, 9, 9, 2, bg, border);
      });
    });

    // Legend
    ctx.textAlign = "left";
    ctx.fillStyle = "#666666";
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillText("LESS ACTIVE", 70, 490);

    const legendColors = [
      { bg: "#121212", border: "#222222" },
      { bg: "#062216", border: "#0b4129" },
      { bg: "#053d26", border: "#0e6440" },
      { bg: "#0c7a4e", border: "#10b981" },
      { bg: "#10b981", border: "#6ee7b7" }
    ];

    legendColors.forEach((color, i) => {
      drawRoundRect(ctx, 160 + i * 26, 477, 18, 18, 3, color.bg, color.border);
    });

    ctx.fillText("PEAK FOCUS", 305, 490);

    ctx.textAlign = "right";
    ctx.fillStyle = "#10b981";
    ctx.fillText(`TARGET: ${(metric.weeklyGoal / 7).toFixed(0)} ${metric.unit}/DAY`, 750, 490);

    // Sidebar/Stats Panel Background
    ctx.textAlign = "left";
    drawRoundRect(ctx, 790, 155, 370, 390, 0, "#0b0b0b", "#1a1a1a");

    // Sidebar header tag
    ctx.fillStyle = "#161616";
    ctx.fillRect(800, 155, 130, 20);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("TELEMETRY_LEDGER", 865, 169);

    // Stats box helper function
    const drawStatBox = (title: string, value: string, yPos: number, isAccent: boolean) => {
      drawRoundRect(ctx, 810, yPos, 330, 65, 4, "#0e0e0e", "#1c1c1c");
      ctx.textAlign = "left";
      ctx.fillStyle = "#666666";
      ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(title, 825, yPos + 22);

      ctx.fillStyle = isAccent ? "#10b981" : "#ffffff";
      ctx.font = "bold 20px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(value, 825, yPos + 48);
    };

    drawStatBox("TOTAL REGISTERED ACCUMULATION", `${totalIncomeLogged.toLocaleString()} ${metric.unit}`, 190, false);
    drawStatBox("CURRENT OPERATIONAL FOCUS STREAK", `${currentStreak()} DAYS`, 270, true);
    drawStatBox("OVERALL MATRIX CONSISTENCY (FULL YEAR)", `${Math.round((activeDays / 371) * 100)}%`, 350, false);

    // Velocity trend readout
    ctx.fillStyle = "#222222";
    ctx.fillRect(810, 430, 330, 1);

    ctx.textAlign = "left";
    ctx.fillStyle = "#666666";
    ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillText("30D LINEAR TRAJECTORY VELOCITY", 810, 455);

    ctx.fillStyle = slope > 0 ? "#10b981" : slope < 0 ? "#f43f5e" : "#888888";
    ctx.font = "bold 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillText(`${velocityFormatted} ${metric.unit}/DAY`, 810, 478);

    ctx.fillStyle = "#888888";
    ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.fillText(`CLASSIFICATION: ${velocityStatus.toUpperCase()}`, 810, 500);

    // Footer
    ctx.fillStyle = "#444444";
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.fillText("CONFIDENTIAL // OBSESSION_OS SIGNAL MATRIX EXPORT", 40, 580);

    ctx.textAlign = "right";
    const dateFormatted = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    ctx.fillText(`GENERATED: ${dateFormatted} // CO-PILOT_OS`, 1160, 580);

    // Trigger download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `obsession-pulse-${metric.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div id="pulse-heatmap-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Daily Heatmap Grid */}
      <div className="lg:col-span-8 bg-[#0a0a0a] border border-neutral-800 p-6 rounded-none relative">
        <div className="absolute top-0 right-0 bg-neutral-900 border-l border-b border-neutral-800 px-3 py-1 font-mono text-[10px] text-neutral-500 tracking-wider">
          PULSE_GRID_V1.0
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neutral-400" />
            <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-200">
              Income Consistency Grid
            </h2>
          </div>
          <button
            id="export-grid-image-btn"
            onClick={exportAsImage}
            className="flex items-center gap-2 border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-500 text-white font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 transition rounded-none cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            Export Image Card
          </button>
        </div>

        {/* The Heatmap Grid */}
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="min-w-[620px]">
            {/* Months Header row */}
            <div className="relative h-5 mb-1 pl-10 text-[9px] font-mono text-neutral-500 select-none">
              {weeks.map((week, wIdx) => {
                const firstDay = new Date(week[0] + "T00:00:00");
                const currentMonth = firstDay.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                
                let showMonth = false;
                if (wIdx === 0) {
                  showMonth = true;
                } else {
                  const prevWeek = weeks[wIdx - 1];
                  const prevFirstDay = new Date(prevWeek[0] + "T00:00:00");
                  const prevMonth = prevFirstDay.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                  if (currentMonth !== prevMonth) {
                    showMonth = true;
                  }
                }

                if (!showMonth) return null;

                // Position dynamically based on percentage across 53 weeks
                return (
                  <span
                    key={wIdx}
                    className="absolute whitespace-nowrap"
                    style={{ left: `calc(2.5rem + ${(wIdx / 53) * 92}%)` }}
                  >
                    {currentMonth}
                  </span>
                );
              })}
            </div>

            <div className="flex gap-1.5">
              {/* Day Labels Column */}
              <div className="grid grid-rows-7 gap-1.5 text-[9px] font-mono text-neutral-500 pr-2 w-8 text-right pt-0.5 select-none">
                {dayNames.map((day, idx) => (
                  <span key={idx} className="h-4 leading-4">{day}</span>
                ))}
              </div>

              {/* Grid Cells Columns */}
              <div className="flex gap-1 flex-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-rows-7 gap-1 flex-1">
                    {week.map((dateStr) => {
                      const isSelected = dateStr === selectedDate;
                      return (
                        <button
                          key={dateStr}
                          id={`cell-${dateStr}`}
                          onClick={() => handleCellClick(dateStr)}
                          className={`h-4 w-full rounded-sm border transition-all cursor-pointer relative group ${getColorClass(dateStr)} ${
                            isSelected ? "ring-1 ring-white scale-110 z-10" : ""
                          }`}
                          title={`${formatDateDisplay(dateStr)}: ${getLogForDate(dateStr)?.value || 0} ${metric.unit}`}
                        >
                          {/* Mini tooltip */}
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-white py-1 px-2 whitespace-nowrap rounded-none z-50">
                            {formatDateDisplay(dateStr)}
                            <span className="block text-emerald-400">
                              {getLogForDate(dateStr)?.value || 0} {metric.unit}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-900 text-[10px] font-mono text-neutral-500">
          <div className="flex items-center gap-3">
            <span>LESS ACTIVE</span>
            <div className="flex gap-1">
              <span className="w-3.5 h-3.5 rounded-sm bg-neutral-900 border border-neutral-800"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-950/40 border border-emerald-900/60"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-900/60 border border-emerald-800"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-700 border border-emerald-600"></span>
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-400"></span>
            </div>
            <span>INTENSE FOCUS</span>
          </div>
          <span className="text-[10px] tracking-wide text-emerald-500/80">
            ● target: {(metric.weeklyGoal / 7).toFixed(0)} {metric.unit}/day
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-900 text-center">
          <div className="bg-neutral-950 border border-neutral-900 p-3">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">Total Logged</div>
            <div className="font-mono text-lg text-white font-semibold mt-1">
              {totalIncomeLogged.toLocaleString()} <span className="text-xs text-neutral-400">{metric.unit}</span>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-3">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">Focus Streak</div>
            <div className="font-mono text-lg text-emerald-400 font-semibold mt-1">
              {currentStreak()} <span className="text-xs text-neutral-400">days</span>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-3">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">Consistency</div>
            <div className="font-mono text-lg text-white font-semibold mt-1">
              {Math.round((activeDays / 371) * 100)}%
            </div>
          </div>
        </div>

        {/* Trend Line Visualizer Section */}
        <div className="mt-6 pt-6 border-t border-neutral-900 relative">
          <div className="absolute top-0 right-0 bg-neutral-900 border-l border-b border-neutral-800 px-3 py-1 font-mono text-[10px] text-neutral-500 tracking-wider">
            VELOCITY_MONITOR
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-300">
                  30-Day Income Growth Velocity
                </h3>
              </div>
              <p className="text-neutral-500 text-[10px] font-mono mt-0.5 uppercase">
                Fitted Linear Trajectory of Registered Telemetry Logs
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`font-mono text-xs font-bold flex items-center justify-end gap-1 ${velocityColor}`}>
                  <VelocityIcon className="w-3.5 h-3.5" />
                  {velocityFormatted} {metric.unit}/day
                </div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase">
                  {velocityStatus}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* SVG Sparkline + Trendline */}
            <div className="md:col-span-3 bg-neutral-950/40 border border-neutral-900 p-3 relative overflow-hidden">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Y Axis Gridlines */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const val = ratio * maxVal;
                  const yPos = getY(val);
                  return (
                    <g key={i}>
                      <line 
                        x1={padding.left} 
                        y1={yPos} 
                        x2={svgWidth - padding.right} 
                        y2={yPos} 
                        className="stroke-neutral-900 stroke-1" 
                        strokeDasharray="2,4"
                      />
                      <text 
                        x={padding.left - 8} 
                        y={yPos + 3} 
                        className="fill-neutral-600 font-mono text-[8px] text-right" 
                        textAnchor="end"
                      >
                        {val.toFixed(0)}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis labels (First, Middle, Last) */}
                <text 
                  x={getX(0)} 
                  y={svgHeight - 4} 
                  className="fill-neutral-500 font-mono text-[8px]"
                >
                  30D AGO
                </text>
                <text 
                  x={getX(Math.floor(n30 / 2))} 
                  y={svgHeight - 4} 
                  className="fill-neutral-500 font-mono text-[8px]" 
                  textAnchor="middle"
                >
                  15D AGO
                </text>
                <text 
                  x={getX(n30 - 1)} 
                  y={svgHeight - 4} 
                  className="fill-neutral-500 font-mono text-[8px]" 
                  textAnchor="end"
                >
                  TODAY
                </text>

                {/* Shaded Area for actual values */}
                <polygon 
                  points={areaPointsStr} 
                  className="fill-emerald-950/10 stroke-none"
                />

                {/* Actual value line */}
                <polyline 
                  points={pointsStr} 
                  fill="none" 
                  className="stroke-emerald-800 stroke-1.5" 
                />

                {/* Fitted Trend Line */}
                <line 
                  x1={trendStartX} 
                  y1={trendStartY} 
                  x2={trendEndX} 
                  y2={trendEndY} 
                  className="stroke-white stroke-1" 
                  strokeDasharray="4,4"
                />

                {/* Interactive hovered dot indicator */}
                {hoveredIndex !== null && (
                  <g>
                    <line 
                      x1={getX(hoveredIndex)} 
                      y1={padding.top} 
                      x2={getX(hoveredIndex)} 
                      y2={svgHeight - padding.bottom} 
                      className="stroke-neutral-800 stroke-1" 
                    />
                    <circle 
                      cx={getX(hoveredIndex)} 
                      cy={getY(last30Data[hoveredIndex].value)} 
                      r="4" 
                      className="fill-emerald-400 stroke-white stroke-1"
                    />
                  </g>
                )}

                {/* Invisible hover regions for interactive tooltip */}
                {last30Data.map((d, i) => (
                  <rect 
                    key={i} 
                    x={getX(i) - (svgWidth - padding.left - padding.right) / (2 * (n30 - 1))} 
                    y={padding.top} 
                    width={(svgWidth - padding.left - padding.right) / (n30 - 1)} 
                    height={svgHeight - padding.top - padding.bottom} 
                    className="fill-transparent cursor-crosshair" 
                    onMouseEnter={() => setHoveredIndex(i)} 
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </svg>
            </div>

            {/* Right side tooltip / velocity stat card */}
            <div className="bg-neutral-950 border border-neutral-900 p-4 h-full flex flex-col justify-between min-h-[100px]">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-wider">
                  TELEMETRY DETECTOR
                </span>
                {hoveredIndex !== null ? (
                  <div className="mt-1">
                    <div className="font-mono text-white text-[10px] font-semibold">
                      {new Date(last30Data[hoveredIndex].date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                    <div className="font-mono text-emerald-400 text-lg font-bold mt-1">
                      {last30Data[hoveredIndex].value} <span className="text-xs text-neutral-400">{metric.unit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-neutral-400 text-[11px] font-mono leading-relaxed uppercase">
                    Hover data points on the grid to inspect daily signals.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-neutral-900/60 text-[9px] font-mono text-neutral-500 uppercase">
                {slope > 0 ? (
                  <span className="text-emerald-500/80">▲ EXPONENTIAL ACCELERATION</span>
                ) : slope < 0 ? (
                  <span className="text-rose-500/80">▼ INTENSITY RETRACTING</span>
                ) : (
                  <span>■ VELOCITY STABILIZED</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Detail View of Selected Day */}
      <div className="lg:col-span-4 bg-[#0a0a0a] border border-neutral-800 p-6 rounded-none flex flex-col justify-between relative">
        <div className="absolute top-0 right-0 bg-neutral-900 border-l border-b border-neutral-800 px-3 py-1 font-mono text-[10px] text-neutral-500 tracking-wider">
          COMMAND_PORT_A
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-500" />
            Selected Terminal
          </h3>
          <div className="font-mono text-sm text-white border-b border-neutral-900 pb-3 mb-4">
            {formatDateDisplay(selectedDate)}
          </div>

          {!isEditing && activeLog ? (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-900 p-4">
                <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Registered Output</div>
                <div className="font-mono text-2xl font-bold text-white">
                  {activeLog.value} <span className="text-sm font-normal text-neutral-400">{metric.unit}</span>
                </div>
              </div>

              {activeLog.note && (
                <div className="bg-neutral-950 border border-neutral-900 p-4">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1">Context Notes</div>
                  <div className="font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {activeLog.note}
                  </div>
                </div>
              )}

              <button
                id="edit-log-btn"
                onClick={() => {
                  setLogValue(activeLog.value.toString());
                  setLogNote(activeLog.note);
                  setIsEditing(true);
                }}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs py-2 uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                Overwrite Entry
              </button>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">
                  Value ({metric.unit})
                </label>
                <input
                  id="log-value-input"
                  type="number"
                  placeholder="0.00"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono p-3 text-sm focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">
                  Operational Note
                </label>
                <textarea
                  id="log-note-input"
                  rows={4}
                  placeholder="E.g. closed enterprise deal, finalized contract speed prototype draft..."
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white font-mono p-3 text-xs focus:outline-none focus:border-neutral-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="save-log-btn"
                  onClick={handleSave}
                  className="flex-1 bg-white hover:bg-neutral-200 text-neutral-950 font-mono text-xs py-2 uppercase tracking-wider flex items-center justify-center gap-1 font-bold transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Entry
                </button>
                <button
                  id="cancel-log-btn"
                  onClick={() => setIsEditing(false)}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 font-mono text-xs px-4 py-2 uppercase tracking-wider transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-mono text-xs text-neutral-500 mb-4">
                No entry captured for this date.
              </p>
              <button
                id="create-log-btn"
                onClick={() => setIsEditing(true)}
                className="mx-auto bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs py-2 px-4 uppercase tracking-wider font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Initialize Entry
              </button>
            </div>
          )}
        </div>

        {/* Informative advice */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex items-start gap-2 text-[10px] font-mono text-neutral-500">
          <Info className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Consistent logging locks in psychological momentum. A single day of 0 is a pause; two consecutive days is the start of a regression.
          </p>
        </div>

        {/* Real Data Calibration Controls */}
        {onBulkUpdateLogs && (
          <div className="mt-6 pt-4 border-t border-neutral-900 space-y-4">
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-bold">
              // SYSTEM_DATA_CALIBRATION
            </div>
            
            {calibrationSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 font-mono text-[10px] text-emerald-400">
                {calibrationSuccess}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Average past value"
                  value={backfillVal}
                  onChange={(e) => setBackfillVal(e.target.value)}
                  className="w-1/2 bg-neutral-950 border border-neutral-800 text-white font-mono p-1.5 text-[10px] focus:outline-none focus:border-neutral-500"
                />
                <button
                  id="backfill-btn"
                  onClick={handleBackfillLogs}
                  className="w-1/2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[9px] py-1.5 uppercase font-bold tracking-wider transition"
                >
                  Back-fill Past Days
                </button>
              </div>
              <p className="text-[9px] text-neutral-600 leading-snug">
                Enter your average {metric.unit} and click "Back-fill" to populate all past 371 days with this baseline.
              </p>
            </div>

            {/* Excel / CSV Import Section */}
            <div className="pt-3 border-t border-neutral-900/50 space-y-2">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Spreadsheet Upload (Excel/CSV)
              </div>
              <div className="relative border border-dashed border-neutral-800 bg-neutral-950 p-4 hover:border-neutral-700 transition-all text-center">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleImportSpreadsheet}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-emerald-500/80 mb-1.5" />
                <span className="block text-[10px] font-mono text-neutral-300">
                  DRAG & DROP OR CLICK TO UPLOAD
                </span>
                <span className="block text-[8px] font-mono text-neutral-500 uppercase mt-1">
                  Supports .xlsx, .xls, .csv (Headers: Date, Value, Note)
                </span>
              </div>
              
              {importError && (
                <p className="text-[9px] font-mono text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 leading-relaxed">
                  ERROR: {importError}
                </p>
              )}
              {importSuccess && (
                <p className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-2 leading-relaxed">
                  SUCCESS: {importSuccess}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-900/50">
              {showConfirmClear ? (
                <div className="bg-neutral-950 border border-rose-950 p-2 space-y-2">
                  <p className="text-[9px] text-rose-400">
                    CONFIRM PURGING ALL DEMO DATA. THIS ACTION IS ENTIRELY IRREVERSIBLE.
                  </p>
                  <div className="flex gap-2">
                    <button
                      id="confirm-purge-btn"
                      onClick={handleClearAllLogs}
                      className="bg-rose-950 text-rose-200 border border-rose-800 hover:bg-rose-900 text-[9px] px-2 py-1 uppercase font-mono tracking-wider transition font-bold"
                    >
                      Yes, Purge
                    </button>
                    <button
                      id="cancel-purge-btn"
                      onClick={() => setShowConfirmClear(false)}
                      className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-[9px] px-2 py-1 uppercase font-mono tracking-wider transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="purge-mock-btn"
                  onClick={() => setShowConfirmClear(true)}
                  className="w-full bg-neutral-950 hover:bg-neutral-900/40 text-neutral-500 hover:text-rose-400 border border-neutral-900 hover:border-rose-950 font-mono text-[9px] py-1.5 uppercase tracking-widest transition"
                >
                  Reset Grid (Purge Mock Data)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
