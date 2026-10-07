import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, defaultVisible = false, ...props }: Omit<ComponentProps<typeof Input>, "type"> & { defaultVisible?: boolean }) {
  const [show, setShow] = useState(defaultVisible);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={cn("pr-10", className)} />
      <button type="button" onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ficha nenosiri / Hide password" : "Onyesha nenosiri / Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
