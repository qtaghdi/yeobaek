import { useCallback, useState } from "react";
import "src/components/examples/example.scss";
import "./asset-base.scss";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const assets = { root: "/favicon.svg", project: base + "/favicon.svg" };

type Result = "loading" | "loaded" | "unavailable";

const messages: Record<Result, string> = {
  loading: "이미지를 요청하는 중입니다.",
  loaded: "이미지가 로드되었습니다.",
  unavailable: "이 주소에서 이미지를 불러오지 못했습니다.",
};

export const AssetBaseExample = () => {
  const [mode, setMode] = useState<keyof typeof assets>("project");
  const [result, setResult] = useState<Result>("loading");
  const trackImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete) setResult(image.naturalWidth > 0 ? "loaded" : "unavailable");
  }, []);

  const selectPath = (path: typeof mode) => {
    if (path === mode) return;
    setResult("loading");
    setMode(path);
  };

  return (
    <div className="inline-example asset-base">
      <fieldset className="asset-base__paths">
        <legend>이미지 요청 경로</legend>
        <div className="inline-example__row">
          <button type="button" className="inline-example__button" aria-pressed={mode === "project"} onClick={() => selectPath("project")}>
            프로젝트 경로
          </button>
          <button type="button" className="inline-example__button" aria-pressed={mode === "root"} onClick={() => selectPath("root")}>
            도메인 루트
          </button>
        </div>
      </fieldset>
      <div className="asset-base__preview" data-result={result}>
        <div className="asset-base__icon">
          <img
            key={mode}
            ref={trackImage}
            src={assets[mode]}
            width="32"
            height="32"
            alt=""
            onLoad={() => setResult("loaded")}
            onError={() => setResult("unavailable")}
          />
        </div>
        <div>
          <strong>여백</strong>
          <p><code>{assets[mode]}</code></p>
        </div>
      </div>
      <p className="asset-base__result" role="status">{messages[result]}</p>
    </div>
  );
};
