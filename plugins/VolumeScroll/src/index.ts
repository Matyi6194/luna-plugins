import type { LunaUnload } from "@luna/core";
import { redux } from "@luna/lib";
import { storage } from "./Settings";
export { Settings } from "./Settings";

function onScroll(event: WheelEvent) {
	if (!event.deltaY) return;

	const { playbackControls } = redux.store.getState();
	const changeBy = event.shiftKey ? storage.changeByShift : storage.changeBy;

	const volumeChange = event.deltaY > 0 ? -changeBy : changeBy;
	const newVolume = playbackControls.volume + volumeChange;
	const clampVolume = Math.min(100, Math.max(0, newVolume));

	redux.actions["playbackControls/SET_VOLUME"]({
		volume: clampVolume,
	});
}

let element: HTMLDivElement | null = null;

function initElement() {
	if (element) return;

	const el = document.querySelector('div[class^="_sliderContainer"]') as HTMLDivElement | null;

	if (el) {
		element = el;
		element.addEventListener("wheel", onScroll);
		return;
	}

	const observer = new MutationObserver(() => {
		const el = document.querySelector('div[class^="_sliderContainer"]') as HTMLDivElement | null;
		if (!el) return;

		element = el;
		element.addEventListener("wheel", onScroll);
		observer.disconnect();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
}

export const unloads = new Set<LunaUnload>();

unloads.add(() => {
	if (element) {
		element.removeEventListener("wheel", onScroll);
		element = null;
	}
});

redux.intercept("page/SET_PAGE_ID", unloads, initElement);

initElement();
