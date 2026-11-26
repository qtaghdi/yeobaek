import { useState } from "react";
import "src/components/examples/example.scss";
import "./runtime-user.scss";

type User = { name: string };

const parseUser = (value: unknown): User | null => {
  if (typeof value !== "object" || value === null) return null;
  if (!("name" in value) || typeof value.name !== "string") return null;
  return { name: value.name };
};

const assertedGreeting = (value: unknown) => {
  try {
    const user = value as User;
    return `${user.name.trim()}님, 안녕하세요.`;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return "TypeError · 이름을 표시하지 못했습니다.";
  }
};

const payloads = {
  valid: '{ "name": "여백" }',
  invalid: '{ "name": null }',
};

export const RuntimeUserExample = () => {
  const [selected, setSelected] = useState<keyof typeof payloads>("invalid");
  const payload = payloads[selected];
  const response: unknown = JSON.parse(payload);
  const user = parseUser(response);

  return (
    <div className="inline-example runtime-user">
      <label className="runtime-user__pick">
        API 응답{" "}
        <select value={selected} onChange={(event) => setSelected(event.currentTarget.value === "valid" ? "valid" : "invalid")}>
          <option value="invalid">이름이 null인 응답</option>
          <option value="valid">이름이 문자열인 응답</option>
        </select>
      </label>
      <pre className="runtime-user__payload"><code>{payload}</code></pre>
      <div className="inline-example inline-example--comparison">
        <div className="runtime-user__result" data-error={user === null}>
          <p className="inline-example__caption"><code>as User</code></p>
          <output>{assertedGreeting(response)}</output>
        </div>
        <div className="runtime-user__result">
          <p className="inline-example__caption"><code>parseUser(response)</code></p>
          <output>{user ? `${user.name.trim()}님, 안녕하세요.` : "이름을 불러올 수 없습니다."}</output>
        </div>
      </div>
    </div>
  );
};
