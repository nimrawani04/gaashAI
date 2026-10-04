import { useEffect, useState } from "react";
import { getRememberMe, setRememberMe } from "@/lib/remember-me";

export default function RememberMe({ className = "" }: { className?: string }) {
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    setChecked(getRememberMe());
  }, []);

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2 text-sm text-foreground ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          setRememberMe(e.target.checked);
        }}
        className="h-4 w-4 rounded border-border accent-primary"
      />
      Keep me signed in
    </label>
  );
}
