import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={
        className ||
        "flex h-9 w-9 xs:h-10 xs:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      }
    >
      {dark ? <Sun className="h-4 w-4 xs:h-5 xs:w-5" /> : <Moon className="h-4 w-4 xs:h-5 xs:w-5" />}
    </button>
  );
}
