import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@oddmash/ui/button";
import { Select, type SelectOption } from "@oddmash/ui/select";
import "@oddmash/ui/styles.css";
import "src/components/examples/example.scss";
import "./select-contract.scss";

const options: readonly SelectOption[] = [
  { value: "in-progress", label: "진행 중" },
  { value: "pending-review", label: "검토 대기", disabled: true },
  { value: "done", label: "완료" },
];

export const SelectContractExample = () => {
  const [ready, setReady] = useState(false);
  const [submission, setSubmission] = useState<string | null>(null);

  useEffect(() => { setReady(true); }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("status");
    if (typeof value === "string") setSubmission(value);
  };

  return (
    <form className="inline-example select-contract" onSubmit={submit} onReset={() => setSubmission(null)}>
      <div className="select-contract__field">
        <p id="select-contract-label" className="inline-example__caption">작업 상태</p>
        <Select aria-labelledby="select-contract-label" name="status" options={options} defaultValue="in-progress" disabled={!ready} />
      </div>
      <div className="inline-example__row">
        <Button type="submit" disabled={!ready}>전송값 확인</Button>
        <Button type="reset" variant="secondary" disabled={!ready}>초기 상태로</Button>
      </div>
      <p className="select-contract__result" role="status">
        {submission === null
          ? ready ? "전송값이 여기에 표시됩니다." : "예제를 준비하는 중입니다."
          : <>폼 전송값 <code>status={submission}</code></>}
      </p>
    </form>
  );
};
