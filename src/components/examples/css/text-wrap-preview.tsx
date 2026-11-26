import { Slider } from "@oddmash/ui/slider";
import { useState } from "react";
import "src/components/examples/example.scss";
import "./text-wrap-preview.scss";

const samples = [
  { rule: "word-break: normal", mode: "normal" },
  { rule: "word-break: keep-all", mode: "words" },
  { rule: "keep-all + text-wrap: balance", mode: "balance" },
];

export const TextWrapPreview = () => {
  const [width, setWidth] = useState(55);

  return (
    <div className="inline-example text-wrap-preview">
      <label className="inline-example__check">
        카드 폭 {width}%
        <Slider
          aria-label="카드 폭"
          min={45}
          max={100}
          value={width}
          aria-valuetext={`${width}%`}
          onChange={(event) => setWidth(event.currentTarget.valueAsNumber)}
        />
      </label>
      {samples.map(({ rule, mode }) => (
        <figure className="text-wrap-preview__sample" key={mode}>
          <figcaption><code>{rule}</code></figcaption>
          <p className="text-wrap-preview__text" data-wrap-mode={mode} style={{ inlineSize: `${width}%` }}>
            작은 화면에서도 패키지 매니저 이름을 읽기 쉽게 표시합니다.
          </p>
        </figure>
      ))}
    </div>
  );
};
