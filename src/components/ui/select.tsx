import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent } from "react";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = Pick<ComponentPropsWithoutRef<"button">, "disabled" | "aria-label" | "aria-labelledby"> & {
  options: readonly SelectOption[];
  name: string;
  defaultValue: string;
};

export const Select = ({ options, name, defaultValue, disabled, ...label }: SelectProps) => {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const enabled = options.flatMap((option, index) => option.disabled ? [] : [index]);
  const initial = () => options.findIndex(option => option.value === defaultValue && !option.disabled);
  const [selected, setSelected] = useState(initial);
  const [active, setActive] = useState(-1);
  const [keyboard, setKeyboard] = useState(false);
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const expanded = open && !disabled && enabled.length > 0;
  const close = () => { setOpen(false); setActive(-1); };
  const choose = (index: number) => {
    if (disabled || !options[index] || options[index].disabled) return;
    setSelected(index);
    close();
    trigger.current?.focus();
  };
  const reveal = (withKeyboard: boolean) => {
    if (disabled || !enabled.length) return;
    setKeyboard(withKeyboard);
    setActive(enabled.includes(selected) ? selected : enabled[0]);
    setOpen(true);
  };

  useEffect(() => {
    const form = trigger.current?.form;
    const reset = () => { setSelected(initial()); close(); };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, options]);

  useEffect(() => {
    if (!expanded) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (rect) setAbove(window.innerHeight - rect.bottom < Math.min(200, (list.current?.scrollHeight ?? 0) + 12) && rect.top > window.innerHeight - rect.bottom);
    };
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    place();
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", place);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !keyboard || active < 0 || !list.current) return;
    const option = list.current.children[active] as HTMLElement | undefined;
    if (!option) return;
    const area = list.current.getBoundingClientRect();
    const item = option.getBoundingClientRect();
    if (item.top < area.top) list.current.scrollTop -= area.top - item.top;
    if (item.bottom > area.bottom) list.current.scrollTop += item.bottom - area.bottom;
  }, [expanded, keyboard, active]);

  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!enabled.length || disabled) return;
    const key = event.key;
    if (key === "Tab") { close(); return; }
    if (key === "Escape" && expanded) { event.preventDefault(); close(); return; }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (expanded) choose(active); else reveal(true);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) return;
    event.preventDefault();
    if (!expanded) { reveal(true); return; }
    const index = enabled.indexOf(active);
    setKeyboard(true);
    setActive(key === "Home" ? enabled[0] : key === "End" ? enabled[enabled.length - 1] :
      enabled[(index + (key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length]);
  };

  return (
    <div className="yb-select" ref={root} data-placement={above ? "above" : "below"}>
      <button {...label} ref={trigger} type="button" className="yb-select__trigger" role="combobox" disabled={disabled}
        aria-disabled={!enabled.length || undefined} aria-expanded={expanded} aria-controls={id}
        aria-activedescendant={expanded && active >= 0 ? id + "-" + active : undefined}
        onKeyDown={handleKeys} onBlur={close} onClick={() => expanded ? close() : reveal(false)}>
        <span>{options[selected]?.label ?? "선택하세요"}</span>
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {selected >= 0 && <input type="hidden" name={name} value={options[selected].value} disabled={disabled} />}
      <ul ref={list} id={id} role="listbox" aria-label="선택 항목" hidden={!expanded}>
        {options.map((option, index) => (
          <li key={option.value} id={id + "-" + index} role="option" aria-selected={selected === index}
            aria-disabled={option.disabled || undefined} data-active={active === index || undefined}
            data-keyboard-active={keyboard && active === index || undefined}
            onPointerMove={event => { if (!option.disabled && event.pointerType !== "touch") { setKeyboard(false); setActive(index); } }}
            onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>{option.label}</li>
        ))}
      </ul>
    </div>
  );
};
