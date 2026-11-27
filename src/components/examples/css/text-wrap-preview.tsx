import { Input } from "@oddmash/ui/input";
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
  const [sample, setSample] = useState("작은 화면에서도 패키지 매니저 이름을 읽기 쉽게 표시합니다.");

  return (
    <div className="inline-example text-wrap-preview">
      <label className="text-wrap-preview__input">
        비교할 문장
        <Input value={sample} maxLength={160} onChange={event => setSample(event.currentTarget.value)} />
      </label>
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
            {sample || "\u00a0"}
          </p>
        </figure>
      ))}
    </div>
  );
};
