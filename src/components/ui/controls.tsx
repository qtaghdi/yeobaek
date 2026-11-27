import type { ComponentPropsWithoutRef } from "react";

const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(" ");

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: "primary" | "secondary" | "ghost" };

export const Button = ({ className, variant = "primary", type = "button", ...props }: ButtonProps) => (
  <button {...props} type={type} className={classes("yb-button", "yb-button--" + variant, className)} />
);

export const Input = ({ className, ...props }: ComponentPropsWithoutRef<"input">) => (
  <input {...props} className={classes("yb-input", className)} />
);

export const Textarea = ({ className, ...props }: ComponentPropsWithoutRef<"textarea">) => (
  <textarea {...props} className={classes("yb-input", className)} />
);

type ChoiceProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

export const Checkbox = ({ className, ...props }: ChoiceProps) => (
  <input {...props} type="checkbox" className={classes("yb-checkbox", className)} />
);

export const Radio = ({ className, ...props }: ChoiceProps) => (
  <input {...props} type="radio" className={classes("yb-radio", className)} />
);

export const Slider = ({ className, ...props }: ChoiceProps) => (
  <input {...props} type="range" className={classes("yb-slider", className)} />
);
