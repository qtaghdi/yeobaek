import { useState } from "react";
import "../example.scss";

export const SemanticControlsExample = () => {
  const [fake, setFake] = useState(0);
  const [native, setNative] = useState(0);

  return (
    <div className="inline-example inline-example--comparison">
      <div>
        <p className="inline-example__caption">div · 의도된 실패</p>
        <div className="inline-example__button" onClick={() => setFake((value) => value + 1)}>
          클릭 {fake}
        </div>
      </div>
      <div>
        <p className="inline-example__caption">button · 기본 동작</p>
        <button className="inline-example__button" type="button" onClick={() => setNative((value) => value + 1)}>
          클릭 {native}
        </button>
      </div>
    </div>
  );
};
