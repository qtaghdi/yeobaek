import { useState } from "react";
import "src/components/examples/example.scss";

export const TabOrderExample = () => {
  const [skip, setSkip] = useState(false);
  return (
    <div className="inline-example">
      <label className="inline-example__check">
        <input type="checkbox" checked={skip} onChange={(event) => setSkip(event.target.checked)} />
        두 번째 버튼에 tabindex="-1" 적용
      </label>
      <div className="inline-example__row">
        {[1, 2, 3].map((value) => (
          <button key={value} type="button" className="inline-example__button" tabIndex={skip && value === 2 ? -1 : 0}>
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};
