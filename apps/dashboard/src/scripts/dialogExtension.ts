type AfterRequestEvent = {
  target: HTMLElement;
  failed: boolean;
  xhr: XMLHttpRequest;
};

const POPUP_TARGET = "#popup";

// @ts-ignore
htmx.defineExtension("dialogs", {
  onEvent: (name: string, { detail }: CustomEvent<AfterRequestEvent>) => {
    if (name !== "htmx:afterRequest") return;
    if (detail.failed) return;
    if (detail.xhr.status >= 400) return;

    const popup = document.querySelector(POPUP_TARGET);
    if (detail.target === popup) return;
    if (!popup) return;

    popup.innerHTML = "";
  },
});
