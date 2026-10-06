import { cn } from "@/lib/utils";

// React passes unknown lowercase attributes through; TS just doesn't know `switch`.
const SWITCH = { switch: "" } as Record<string, string>;

type Props = { className?: string; style?: React.CSSProperties };

/**
 * iOS haptic trigger, after tijnjh/ios-haptics. iOS 18+ plays its system
 * haptic when a real tap toggles an `<input switch>` (programmatic clicks don't
 * count). A transparent label covers the area and forwards the tap to a hidden
 * switch: the switch itself must never sit under the finger, or WebKit cancels
 * scrolling. Pointer and click events bubble to the parent, which must be
 * `relative` and handles them.
 */
export function HapticSwitch({ className, style }: Props) {
  return (
    <label
      aria-hidden
      data-haptic-trigger=""
      className={cn("absolute inset-0 cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]", className)}
      style={style}
    >
      <input
        type="checkbox"
        {...SWITCH}
        tabIndex={-1}
        className="invisible absolute m-0 size-px"
        // The label re-dispatches its click here; keep that copy from reaching handlers twice.
        onClick={(e) => e.stopPropagation()}
      />
    </label>
  );
}
