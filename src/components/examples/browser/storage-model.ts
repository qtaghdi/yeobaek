export type VirtualTab = { id: number; hasDraft: boolean; refreshes: number };
export type StorageModel = { tabs: VirtualTab[]; activeId: number; nextId: number; dense: boolean; message: string };
export type StorageAction = { type: "new" | "close" | "reload" | "density" | "draft" | "reset" } | { type: "select"; id: number };

const tab = (id: number): VirtualTab => ({ id, hasDraft: false, refreshes: 0 });
export const maxTabs = 4;
export const initialStorage = (): StorageModel => ({ tabs: [tab(1)], activeId: 1, nextId: 2, dense: false, message: "탭 1을 열었습니다." });

export const updateStorage = (state: StorageModel, action: StorageAction): StorageModel => {
  switch (action.type) {
    case "new":
      return state.tabs.length >= maxTabs ? state : { ...state, tabs: [...state.tabs, tab(state.nextId)], activeId: state.nextId, nextId: state.nextId + 1, message: "새 탭에는 이 탭의 sessionStorage가 복사되지 않습니다." };
    case "select":
      return state.tabs.some(item => item.id === action.id) ? { ...state, activeId: action.id, message: `탭 ${action.id}으로 이동했습니다.` } : state;
    case "close": {
      const position = state.tabs.findIndex(item => item.id === state.activeId);
      const tabs = state.tabs.filter(item => item.id !== state.activeId);
      if (!tabs.length) return { ...state, tabs: [tab(state.nextId)], activeId: state.nextId, nextId: state.nextId + 1, message: "마지막 탭을 닫고 빈 탭을 열었습니다. localStorage는 유지됩니다." };
      return { ...state, tabs, activeId: tabs[Math.min(position, tabs.length - 1)].id, message: "닫은 탭의 sessionStorage를 삭제했습니다." };
    }
    case "reload":
      return { ...state, tabs: state.tabs.map(item => item.id === state.activeId ? { ...item, refreshes: item.refreshes + 1 } : item), message: "새로고침해도 두 저장소의 값은 유지됩니다." };
    case "density":
      return { ...state, dense: !state.dense, message: "같은 출처의 모든 탭이 localStorage 값을 공유합니다." };
    case "draft":
      return { ...state, tabs: state.tabs.map(item => item.id === state.activeId ? { ...item, hasDraft: !item.hasDraft } : item), message: "현재 탭의 sessionStorage만 변경했습니다." };
    case "reset":
      return initialStorage();
  }
};
