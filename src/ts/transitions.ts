
export const injectViewTransitionNames = (textElements: HTMLElement[] | HTMLElement) => {

    if (!Array.isArray(textElements)) {
        textElements = [textElements];
    }

    textElements.forEach((textElement) => {
        const nodeType = textElement.nodeType;
        if (nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const textContent = textElement.textContent;
        if (!textContent) {
            return;
        }

        const nameMap: Map<string, number> = new Map();
        const spans: HTMLSpanElement[] = [];

        const chars = textContent.split('');
        chars.forEach((char) => {
            const span = document.createElement('span');

            span.textContent = char;
            spans.push(span);

            const viewTransitionName = `char-${char}`;
            const viewTransitionNameCount = (nameMap.get(viewTransitionName) || 0) + 1;
            nameMap.set(viewTransitionName, viewTransitionNameCount);
            span.style.viewTransitionName = viewTransitionName + "-" + viewTransitionNameCount;
        });

        textElement.innerHTML = '';
        spans.forEach((span) => {
            textElement.appendChild(span);
        });
    });
}

