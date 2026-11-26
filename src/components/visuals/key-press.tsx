export const KeyPress = ({ input, step }: { input?: string; step: number }) => {
  const keys = input && input !== "Click" ? input.split(" + ") : [];
  return (
    <div className="interaction-keypress" aria-hidden="true">
      {keys.length > 0 && (
        <div className="interaction-keypress__keys" key={step}>
          {keys.map((key, index) => (
            <kbd data-key={key} data-modifier={index < keys.length - 1} key={key}>
              {key === "Escape" ? "Esc" : key}
            </kbd>
          ))}
        </div>
      )}
    </div>
  );
};
