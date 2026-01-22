// Main TypeScript entry point

// Import LESS styles
import '../less/index.less';

let hasFuture = false;

const dayMills = 24 * 60 * 60 * 1000;
const nowMills = Date.now();
const thresholdMills = nowMills - dayMills;

const dateDivs: HTMLElement[] = Array.from(document.querySelectorAll('a.date[data-timestamp]:not([data-timestamp=""])'));
for (let i = 0; i < dateDivs.length; i++) {
    const dateDiv = dateDivs[i];
    const timestampStr = dateDiv.getAttribute('data-timestamp')!;
    const dateMills = parseInt(timestampStr);
    if (isNaN(dateMills) || dateMills < thresholdMills) {
        break;
    }

    hasFuture = true;
    dateDiv.classList.add('future');
}

if (hasFuture) {
    document.body.classList.add('has-future');
}