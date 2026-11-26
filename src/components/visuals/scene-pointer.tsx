import "./scene-pointer.scss";

export const ScenePointer = ({ shape = "arrow" }: { shape?: "arrow" | "hand" }) => (
  <span className="scene-pointer" data-shape={shape} aria-hidden="true">
    <svg className="scene-pointer__arrow" viewBox="0 0 24 29" width="24" height="29">
      <path d="M3 2v20l5-4 4 8 4-2-4-8 7-1Z" />
    </svg>
    <svg className="scene-pointer__hand" viewBox="0 0 24 29" width="24" height="29">
      <path d="M8 14V5a2 2 0 0 1 4 0v7-2a1.8 1.8 0 0 1 3.6 0v3-1.6a1.7 1.7 0 0 1 3.4 0V15v-1a1.6 1.6 0 0 1 3.2 0v4c0 2.4-1.1 3.7-2.2 5l-.8 2H10l-.7-2.6L4 16.8a2 2 0 0 1 2.7-2.9l1.3 1.3Z" />
    </svg>
  </span>
);
