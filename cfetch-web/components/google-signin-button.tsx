import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
}

export function GoogleSignInButton({ 
  text = "Sign in with Google", 
  className,
  ...props 
}: GoogleSignInButtonProps) {
  return (
    <button
      type="submit"
      className={cn(
        "flex items-center rounded-md bg-zinc-100 px-4 py-2 text-xs font-medium uppercase tracking-wider text-stone-900 transition hover:bg-white hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]",
        className
      )}
      {...props}
    >
      <img
        src="https://authjs.dev/img/providers/google.svg"
        alt="Google"
        className="mr-2 h-3.5 w-3.5"
      />
      {text}
    </button>
  );
}
