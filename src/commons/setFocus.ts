export const setFocus = (elementId: string) => {
  // 指定 ID の欄にフォーカス
  const element = document.getElementById(elementId);
  element?.focus();
};
