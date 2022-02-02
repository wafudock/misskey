export function getScrollContainer(el: HTMLElement | null): HTMLElement | null {
	if (el == null || el.tagName === 'HTML') return null;
	const overflow = window.getComputedStyle(el).getPropertyValue('overflow');
	if (
		// xとyを個別に指定している場合、`hidden scroll`みたいな値になる
		overflow.endsWith('scroll') ||
		overflow.endsWith('auto')
	) {
		return el;
	} else {
		return getScrollContainer(el.parentElement);
	}
}

export function getStickyTop(el: HTMLElement, container: HTMLElement | null = null, top: number = 0) {
	if (!el.parentElement) return top;
	const data = el.dataset.stickyContainerHeaderHeight;
	const newTop = data ? Number(data) + top : top;
	if (el === container) return newTop;
	return getStickyTop(el.parentElement, container, newTop);
}

export function getScrollPosition(el: HTMLElement | null): number {
	const container = getScrollContainer(el);
	return container == null ? window.scrollY : container.scrollTop;
}

export function onScrollTop(el: HTMLElement, cb: Function) {
	// とりあえず評価してみる
	if (isTopVisible(el)) {
		cb();
		return null;
	}

	const container = getScrollContainer(el) || window;

	const onScroll = ev => {
		if (!document.body.contains(el)) return;
		if (isTopVisible(el)) {
			cb();
			removeListener();
		}
	};

	function removeListener() { container.removeEventListener('scroll', onScroll) }
	container.addEventListener('scroll', onScroll, { passive: true });
	return removeListener;
}

export function onScrollBottom(el: HTMLElement, cb: Function) {
	const container = getScrollContainer(el);

	// とりあえず評価してみる
	if (isBottomVisible(el, 1, container)) {
		cb();
		return null;
	}

	const containerOrWindow = container || window;
	const onScroll = ev => {
		if (!document.body.contains(el)) return;
		if (isBottomVisible(el, 1, container)) {
			cb();
			removeListener();
		}
	};

	function removeListener() { containerOrWindow.removeEventListener('scroll', onScroll) }
	containerOrWindow.addEventListener('scroll', onScroll, { passive: true });
	return removeListener;
}

export function scroll(el: HTMLElement, options: ScrollToOptions | undefined) {
	const container = getScrollContainer(el);
	if (container == null) {
		window.scroll(options);
	} else {
		container.scroll(options);
	}
}

/**
 * Scroll to Top
 * @param el Scroll container element
 * @param options Scroll options
 */
export function scrollToTop(el: HTMLElement, options: { behavior?: ScrollBehavior; } = {}) {
	scroll(el, { top: 0, ...options });
}

/**
 * Scroll to Bottom
 * @param el Content element
 * @param options Scroll options
 * @param container Scroll container element
 * @param addSticky To add sticky-top or not
 */
export function scrollToBottom(el: HTMLElement, options: ScrollToOptions = {}, container = getScrollContainer(el), addSticky: boolean = true) {
	const addStickyTop = addSticky ? getStickyTop(el, container) : 0;
	if (container) {
		container.scroll({ top: el.scrollHeight - container.clientHeight + addStickyTop || 0, ...options });
	} else {
		window.scroll({ top: el.scrollHeight - window.innerHeight + addStickyTop || 0, ...options });
	}
}

export function isTopVisible(el: HTMLElement, asobi: number = 1): boolean {
	const scrollTop = getScrollPosition(el);
	return scrollTop <= asobi;
}

export function isBottomVisible(el: HTMLElement, asobi = 1, container = getScrollContainer(el)) {
	if (container) return el.scrollHeight <= container.clientHeight + Math.abs(container.scrollTop) + asobi;
	return el.scrollHeight <= window.innerHeight + window.scrollY + asobi;
}

// https://ja.javascript.info/size-and-scroll-window#ref-932
export function getBodyScrollHeight() {
	return Math.max(
		document.body.scrollHeight, document.documentElement.scrollHeight,
		document.body.offsetHeight, document.documentElement.offsetHeight,
		document.body.clientHeight, document.documentElement.clientHeight
	);
}
