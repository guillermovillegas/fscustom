"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  AlertCircle,
  Check,
  X,
  Minus,
} from "lucide-react";

import type { TimeSlot } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import {
  addTimeSlot,
  batchAddTimeSlots,
  deleteTimeSlot,
  batchToggleTimeSlots,
} from "@/lib/actions/availability";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS_OF_WEEK = [
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
  { value: 0, label: "Sun", fullLabel: "Sunday" },
] as const;

/** Visual column index for each day_of_week value (Mon=0 … Sun=6) */
const DAY_COL_INDEX: Record<number, number> = {};
DAYS_OF_WEEK.forEach((d, i) => {
  DAY_COL_INDEX[d.value] = i;
});

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 7; // 7 AM to 6 PM
  return {
    value: hour,
    time24: `${hour.toString().padStart(2, "0")}:00`,
    label: formatTimeLabel(hour),
  };
});

function formatTimeLabel(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

function formatTime(timeStr: string): string {
  const [hours] = timeStr.split(":");
  const h = parseInt(hours, 10);
  return formatTimeLabel(h);
}

function addOneHour(time24: string): string {
  const [hours] = time24.split(":");
  const nextHour = parseInt(hours, 10) + 1;
  return `${nextHour.toString().padStart(2, "0")}:00`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AvailabilityManagerProps {
  initialSlots: TimeSlot[];
}

type SlotMap = Map<string, TimeSlot>;

function buildSlotKey(dayOfWeek: number, startTime: string): string {
  const normalized = startTime.slice(0, 5);
  return `${dayOfWeek}-${normalized}`;
}

function buildSlotMap(slots: TimeSlot[]): SlotMap {
  const map: SlotMap = new Map();
  for (const slot of slots) {
    map.set(buildSlotKey(slot.day_of_week, slot.start_time), slot);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Drag types & helpers
// ---------------------------------------------------------------------------

interface CellCoord {
  dayValue: number;
  hour: number;
}

interface DragState {
  active: boolean;
  anchor: CellCoord | null;
  current: CellCoord | null;
  mode: "create" | "toggle";
  toggleTarget: boolean;
}

const INITIAL_DRAG: DragState = {
  active: false,
  anchor: null,
  current: null,
  mode: "create",
  toggleTarget: false,
};

function getDragSelection(
  anchor: CellCoord,
  current: CellCoord
): Set<string> {
  const colA = DAY_COL_INDEX[anchor.dayValue];
  const colB = DAY_COL_INDEX[current.dayValue];
  const minCol = Math.min(colA, colB);
  const maxCol = Math.max(colA, colB);
  const minHour = Math.min(anchor.hour, current.hour);
  const maxHour = Math.max(anchor.hour, current.hour);

  const result = new Set<string>();
  for (let col = minCol; col <= maxCol; col++) {
    const day = DAYS_OF_WEEK[col];
    for (let h = minHour; h <= maxHour; h++) {
      result.add(buildSlotKey(day.value, `${h.toString().padStart(2, "0")}:00`));
    }
  }
  return result;
}

function encodeCellData(dayValue: number, hour: number): string {
  return `${dayValue}-${hour}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AvailabilityManager({
  initialSlots,
}: AvailabilityManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Optimistic toggle state: slotId → target is_active (while save is in-flight)
  const [pendingToggles, setPendingToggles] = useState<Map<string, boolean>>(
    new Map()
  );

  // Drag state
  const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG);
  const dragRef = useRef<DragState>(INITIAL_DRAG);

  // Hover tracking
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Pending creates (optimistic UI)
  const [pendingCreates, setPendingCreates] = useState<Set<string>>(
    new Set()
  );

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    slotId: string;
  } | null>(null);

  const slotMap = useMemo(() => buildSlotMap(initialSlots), [initialSlots]);

  const timeRows = useMemo(() => {
    const hourSet = new Set<number>();
    for (const slot of initialSlots) {
      const h = parseInt(slot.start_time.split(":")[0], 10);
      hourSet.add(h);
    }
    for (const h of HOURS) {
      hourSet.add(h.value);
    }
    return Array.from(hourSet)
      .sort((a, b) => a - b)
      .map((h) => ({
        value: h,
        time24: `${h.toString().padStart(2, "0")}:00`,
        label: formatTimeLabel(h),
      }));
  }, [initialSlots]);

  // Effective active state: uses optimistic pending toggle if in-flight
  const getEffectiveActive = useCallback(
    (slot: TimeSlot): boolean => {
      const pending = pendingToggles.get(slot.id);
      return pending !== undefined ? pending : slot.is_active;
    },
    [pendingToggles]
  );

  // Drag selection
  const dragSelection = useMemo(() => {
    if (!dragState.active || !dragState.anchor || !dragState.current) {
      return new Set<string>();
    }
    return getDragSelection(dragState.anchor, dragState.current);
  }, [dragState]);

  const showFeedback = useCallback(
    (type: "success" | "error", message: string) => {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), 4000);
    },
    []
  );

  // ------ Auto-save toggle ------

  const autoSaveToggles = useCallback(
    async (updates: Array<{ id: string; is_active: boolean }>) => {
      if (updates.length === 0) return;

      // Set optimistic state
      setPendingToggles((prev) => {
        const next = new Map(prev);
        for (const u of updates) {
          next.set(u.id, u.is_active);
        }
        return next;
      });

      const result = await batchToggleTimeSlots(updates);

      // Clear optimistic state for these IDs
      setPendingToggles((prev) => {
        const next = new Map(prev);
        for (const u of updates) {
          next.delete(u.id);
        }
        return next;
      });

      if (result.success) {
        startTransition(() => {
          router.refresh();
        });
      } else {
        showFeedback("error", result.error ?? "Failed to update slots.");
      }
    },
    [router, showFeedback, startTransition]
  );

  // ------ Drag handlers ------

  const handleCellMouseDown = useCallback(
    (e: React.MouseEvent, dayValue: number, hour: number) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const key = buildSlotKey(dayValue, `${hour.toString().padStart(2, "0")}:00`);
      const slot = slotMap.get(key);
      const coord: CellCoord = { dayValue, hour };

      let mode: "create" | "toggle";
      let toggleTarget = false;

      if (!slot) {
        mode = "create";
      } else {
        mode = "toggle";
        const currentActive = getEffectiveActive(slot);
        toggleTarget = !currentActive;
      }

      const newState: DragState = {
        active: true,
        anchor: coord,
        current: coord,
        mode,
        toggleTarget,
      };
      setDragState(newState);
      dragRef.current = newState;
    },
    [slotMap, getEffectiveActive]
  );

  const handleCellMouseEnter = useCallback(
    (dayValue: number, hour: number) => {
      const key = buildSlotKey(dayValue, `${hour.toString().padStart(2, "0")}:00`);
      setHoveredCell(key);

      if (dragRef.current.active) {
        const coord: CellCoord = { dayValue, hour };
        const newState = { ...dragRef.current, current: coord };
        setDragState(newState);
        dragRef.current = newState;
      }
    },
    []
  );

  const handleCellMouseLeave = useCallback(() => {
    if (!dragRef.current.active) {
      setHoveredCell(null);
    }
  }, []);

  // Commit drag — auto-saves immediately
  const commitDrag = useCallback(async () => {
    const state = dragRef.current;
    if (!state.active || !state.anchor || !state.current) return;

    const selection = getDragSelection(state.anchor, state.current);

    if (state.mode === "create") {
      const emptyCells = [...selection].filter((key) => !slotMap.has(key));
      if (emptyCells.length === 0) return;

      setPendingCreates(new Set(emptyCells));

      const slotsToCreate = emptyCells.map((key) => {
        const [dayStr, timeStr] = key.split("-");
        return {
          day_of_week: parseInt(dayStr, 10),
          start_time: timeStr,
          end_time: addOneHour(timeStr),
        };
      });

      const result = await batchAddTimeSlots(slotsToCreate);
      setPendingCreates(new Set());

      if (result.success) {
        if (result.created && result.created > 0) {
          showFeedback(
            "success",
            `${result.created} slot${result.created !== 1 ? "s" : ""} created.`
          );
        }
        startTransition(() => {
          router.refresh();
        });
      } else {
        showFeedback("error", result.error ?? "Failed to create slots.");
      }
    } else {
      // Toggle mode — auto-save all occupied cells in selection
      const updates: Array<{ id: string; is_active: boolean }> = [];
      for (const key of selection) {
        const slot = slotMap.get(key);
        if (slot) {
          updates.push({ id: slot.id, is_active: state.toggleTarget });
        }
      }
      void autoSaveToggles(updates);
    }
  }, [slotMap, router, showFeedback, startTransition, autoSaveToggles]);

  // Document-level mouseup and blur
  useEffect(() => {
    const handleMouseUp = () => {
      if (dragRef.current.active) {
        void commitDrag();
        const reset = { ...INITIAL_DRAG };
        setDragState(reset);
        dragRef.current = reset;
        setHoveredCell(null);
      }
    };

    const handleBlur = () => {
      if (dragRef.current.active) {
        const reset = { ...INITIAL_DRAG };
        setDragState(reset);
        dragRef.current = reset;
        setHoveredCell(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [commitDrag]);

  // ------ Context menu ------

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, key: string) => {
      const slot = slotMap.get(key);
      if (!slot || dragRef.current.active) return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, slotId: slot.id });
    },
    [slotMap]
  );

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenu]);

  // ------ Actions ------

  const handleToggle = useCallback(
    (slot: TimeSlot) => {
      const currentActive = getEffectiveActive(slot);
      void autoSaveToggles([{ id: slot.id, is_active: !currentActive }]);
    },
    [getEffectiveActive, autoSaveToggles]
  );

  const handleDelete = useCallback(
    async (slotId: string) => {
      setIsDeleting(slotId);
      setFeedback(null);
      setContextMenu(null);

      const result = await deleteTimeSlot(slotId);

      if (result.success) {
        showFeedback("success", "Time slot removed.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        showFeedback("error", result.error ?? "Failed to delete time slot.");
      }

      setIsDeleting(null);
    },
    [router, showFeedback, startTransition]
  );

  const handleQuickAdd = useCallback(
    async (dayValue: number, hour: number) => {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = addOneHour(startTime);
      const key = buildSlotKey(dayValue, startTime);

      setPendingCreates((prev) => new Set(prev).add(key));

      const result = await addTimeSlot({
        day_of_week: dayValue,
        start_time: startTime,
        end_time: endTime,
      });

      setPendingCreates((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      if (result.success) {
        showFeedback("success", "Slot added.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        showFeedback("error", result.error ?? "Failed to add slot.");
      }
    },
    [router, showFeedback, startTransition]
  );

  // ------ Cell rendering ------

  const renderDesktopCell = useCallback(
    (dayValue: number, hour: number) => {
      const key = buildSlotKey(dayValue, `${hour.toString().padStart(2, "0")}:00`);
      const slot = slotMap.get(key);
      const isHovered = hoveredCell === key;
      const isInDrag = dragSelection.has(key);
      const isPendingCreate = pendingCreates.has(key);

      if (!slot) {
        return (
          <td
            key={dayValue}
            className="border-b px-1 py-1 text-center"
            data-cell={encodeCellData(dayValue, hour)}
            onMouseDown={(e) => handleCellMouseDown(e, dayValue, hour)}
            onMouseEnter={() => handleCellMouseEnter(dayValue, hour)}
            onMouseLeave={handleCellMouseLeave}
          >
            <div
              className={cn(
                "group/cell relative mx-auto flex h-10 w-full items-center justify-center rounded-md transition-all cursor-pointer",
                isPendingCreate
                  ? "bg-blue-100 animate-pulse dark:bg-blue-900/40"
                  : isInDrag && dragState.mode === "create"
                    ? "bg-blue-100 border-2 border-dashed border-blue-400 dark:bg-blue-900/30"
                    : isHovered
                      ? "bg-blue-50 border-2 border-dashed border-blue-300 dark:bg-blue-900/20"
                      : "bg-muted/30"
              )}
            >
              {isPendingCreate ? (
                <Loader2 className="size-3.5 animate-spin text-blue-500" />
              ) : isInDrag && dragState.mode === "create" ? (
                <Plus className="size-3.5 text-blue-500" />
              ) : isHovered ? (
                <Plus className="size-3.5 text-blue-400" />
              ) : null}
            </div>
          </td>
        );
      }

      const isActive = getEffectiveActive(slot);
      const isToggling = pendingToggles.has(slot.id);
      const isDraggingToggle = isInDrag && dragState.mode === "toggle";

      let dragVisual: "off" | "on" | null = null;
      if (isDraggingToggle) {
        dragVisual = dragState.toggleTarget ? "on" : "off";
      }

      return (
        <td
          key={dayValue}
          className="border-b px-1 py-1 text-center"
          data-cell={encodeCellData(dayValue, hour)}
          onMouseDown={(e) => handleCellMouseDown(e, dayValue, hour)}
          onMouseEnter={() => handleCellMouseEnter(dayValue, hour)}
          onMouseLeave={handleCellMouseLeave}
          onContextMenu={(e) => handleContextMenu(e, key)}
        >
          <div
            className={cn(
              "group/cell relative mx-auto flex h-10 w-full items-center justify-center rounded-md text-xs font-medium transition-all cursor-pointer",
              dragVisual === "off"
                ? "bg-red-100 ring-2 ring-red-300 text-red-600 dark:bg-red-900/30"
                : dragVisual === "on"
                  ? "bg-green-100 ring-2 ring-green-300 text-green-700 dark:bg-green-900/40"
                  : isActive
                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
              isToggling && "opacity-60"
            )}
          >
            {dragVisual === "off" ? (
              <X className="size-3.5" />
            ) : dragVisual === "on" ? (
              <Check className="size-3.5" />
            ) : isToggling ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isActive ? (
              <Check className="size-4" />
            ) : (
              <Minus className="size-3 text-muted-foreground/60" />
            )}

            {isHovered && !dragRef.current.active && isActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete(slot.id);
                }}
                className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover/cell:opacity-100 hover:bg-red-600"
                aria-label="Delete slot"
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        </td>
      );
    },
    [
      slotMap,
      hoveredCell,
      dragSelection,
      dragState,
      pendingCreates,
      pendingToggles,
      getEffectiveActive,
      handleCellMouseDown,
      handleCellMouseEnter,
      handleCellMouseLeave,
      handleContextMenu,
      handleDelete,
    ]
  );

  return (
    <div
      className="space-y-6"
      style={dragState.active ? { userSelect: "none" } : undefined}
    >
      {/* Feedback */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border px-4 py-3 text-sm",
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {feedback.type === "success" ? (
            <Check className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Desktop Schedule Grid */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Click an empty cell to create a slot. Drag to select multiple cells.
            Click an active slot to toggle it. Right-click to delete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-24 border-b px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th
                      key={day.value}
                      className="border-b px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeRows.map((hour) => (
                  <tr key={hour.value}>
                    <td className="border-b border-r px-3 py-1 text-sm font-medium text-muted-foreground">
                      {hour.label}
                    </td>
                    {DAYS_OF_WEEK.map((day) =>
                      renderDesktopCell(day.value, hour.value)
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[140px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            type="button"
            onClick={() => void handleDelete(contextMenu.slotId)}
            disabled={isDeleting === contextMenu.slotId}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent hover:text-destructive cursor-pointer"
          >
            {isDeleting === contextMenu.slotId ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <X className="size-3.5" />
            )}
            Delete slot
          </button>
        </div>
      )}

      {/* Mobile: Stacked day cards with quick-add */}
      <div className="space-y-4 md:hidden">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = initialSlots
            .filter((s) => s.day_of_week === day.value)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

          const usedHours = new Set(
            daySlots.map((s) => parseInt(s.start_time.split(":")[0], 10))
          );
          const availableHours = HOURS.filter((h) => !usedHours.has(h.value));

          return (
            <Card key={day.value}>
              <CardHeader>
                <CardTitle className="text-base">{day.fullLabel}</CardTitle>
                <CardDescription>
                  {daySlots.length} time slot
                  {daySlots.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No slots configured
                  </p>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot) => {
                      const isActive = getEffectiveActive(slot);
                      const isToggling = pendingToggles.has(slot.id);

                      return (
                        <div
                          key={slot.id}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                            isActive
                              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                              : "border-muted bg-muted/30",
                            isToggling && "opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggle(slot)}
                              disabled={isPending || isToggling}
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isActive
                                  ? "bg-green-500 text-white hover:bg-green-600"
                                  : "bg-muted hover:bg-muted/80"
                              )}
                              aria-label={`Toggle ${day.fullLabel} ${formatTime(slot.start_time)}`}
                              aria-pressed={isActive}
                            >
                              {isToggling ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : isActive ? (
                                <Check className="size-4" />
                              ) : null}
                            </button>
                            <div>
                              <p className="text-sm font-medium">
                                {formatTime(slot.start_time)} -{" "}
                                {formatTime(slot.end_time)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isActive ? "Available" : "Unavailable"}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => void handleDelete(slot.id)}
                            disabled={isDeleting === slot.id}
                            aria-label={`Delete ${formatTime(slot.start_time)} slot`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            {isDeleting === slot.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <X className="size-3" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick-add buttons */}
                {availableHours.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quick add:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableHours.map((h) => {
                        const cellKey = buildSlotKey(day.value, h.time24);
                        const isPendingThis = pendingCreates.has(cellKey);
                        return (
                          <button
                            key={h.value}
                            type="button"
                            onClick={() =>
                              void handleQuickAdd(day.value, h.value)
                            }
                            disabled={isPendingThis}
                            className={cn(
                              "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                              "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isPendingThis && "animate-pulse bg-blue-50"
                            )}
                          >
                            {isPendingThis ? (
                              <Loader2 className="size-3 animate-spin mr-1" />
                            ) : (
                              <Plus className="size-3 mr-1" />
                            )}
                            {h.label.replace(":00 ", "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-6 rounded bg-green-100 dark:bg-green-900/40" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-6 rounded bg-muted" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-6 rounded bg-muted/30" />
          <span>Empty (click to create)</span>
        </div>
      </div>
    </div>
  );
}
