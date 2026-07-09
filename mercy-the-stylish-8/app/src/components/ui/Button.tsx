import { cn } from "../../lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "accent" }) {
  const variants = {
    primary: "btn",
    secondary: "btn-secondary",
    accent: "btn-accent"
  };
  return <button className={cn(variants[variant], className)} {...props} />;
}
