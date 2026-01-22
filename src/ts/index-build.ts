// Main TypeScript entry point

import { legacyParser } from '@mokick/core/legacy/parser';
import { edgesOutFilter, edgesOutForEach } from '@mokick/core/lists/edgesOutList';
import { Edge } from '@mokick/core/types/Edge';
import { StringNode } from '@mokick/core/types/StringNode';
import { readdir } from "node:fs/promises";
import legacyMokickGraph from '../../data/data/mokick-graph.json';

const ddMmYyyyRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const dataTimestamp = 'data-timestamp=""'

const dateDivMap = new Map<string, string[]>();
const dateOrder: string[] = [];


type DateEntry = {
    url: string;
    title: string;
    dateString: string;
    dateHuman: string;
    dateDiv: string;
    keywords: string[];
};

const dateEntries: DateEntry[] = [];

const createDateDiv = (edge: Edge) => {
    let html = '';

    const contentEdges = edgesOutFilter(edge.nodeOut!, (e: Edge) => e.type === "CONTENT");
    if (contentEdges.length !== 1) {
        return html;
    }

    const contentNode = contentEdges[0].nodeOut!;
    const textContentEdges = edgesOutFilter(contentNode, (e: Edge) => e.slug === "text");
    if (textContentEdges.length !== 1) {
        return html;
    }

    html += '<div class="date" ' + dataTimestamp + '>';

    let dateTimestamp = 0;
    let dateTitle = "";
    const keywords: string[] = [];

    edgesOutForEach(textContentEdges[0].nodeOut!, (e: Edge) => {
        const slug = e.slug!;

        if (slug.startsWith("p-")) {
            const valueString = (e.nodeOut! as StringNode).valueString;
            keywords.push(valueString);
            html += '<p>' + valueString + '</p>';
        }
        else if (slug.startsWith("h-")) {

            const valueString = (e.nodeOut! as StringNode).valueString;

            if (dateTimestamp === 0) {
                const match = valueString.match(ddMmYyyyRegex);
                if (match) {
                    const [, dd, mm, yyyy] = match;
                    const timestamp = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd)).getTime();
                    
                    if (0 < timestamp) {
                        dateTimestamp = timestamp;
                    }
                }
            }
            else if (dateTitle === "") {
                dateTitle = valueString;
            }
        
            let h = slug === "h-0" ? "h3" : slug === "h-1" ? "h4" : "h5";
            html += '<' + h + '>' + valueString + '</' + h + '>'
        }
        else if (slug.startsWith("list-")) {

            html += '<ul>';

            edgesOutForEach(e.nodeOut!, (e) => {
            const valueString = (e.nodeOut! as StringNode).valueString;
            keywords.push(valueString);
                html += '<li>' + valueString + '</li>';
            });
            html += '</ul>';
        }
    });

    const hasDate = 0 < dateTimestamp;
    if (hasDate) {
        html = html.replace(dataTimestamp, 'data-timestamp="' + dateTimestamp.toString() + '"');
    }

    html += '</div>';

    if (hasDate) {
        const dateTmp = new Date(dateTimestamp);
        const dateString = dateTmp.getUTCFullYear() + '-' +
            String(dateTmp.getUTCMonth() + 1).padStart(2, '0') + '-' +
            String(dateTmp.getUTCDate()).padStart(2, '0');
        if (!dateDivMap.has(dateString)) {
            dateDivMap.set(dateString, []);
            dateOrder.push(dateString);
        }
        const dateDivs = dateDivMap.get(dateString)!;
        dateDivs.push(html);

        dateEntries.push({
            url: '',
            title: dateTitle,
            dateString,
            dateHuman: dateString.split('-').reverse().join('.'),
            dateDiv: html,
            keywords,
        });
    }

    return '\n' + html;
}

const collectDateEntries = () => {

    const rootNode = legacyParser(legacyMokickGraph as any);

    const addressRootNode = edgesOutFilter(rootNode, (edge) => {
        return edge.type === "ADDRESS_ROOT";
    })[0].nodeOut;

    const datesNode = edgesOutFilter(addressRootNode!, (edge) => {
        return edge.type === "ADDRESS_HIERARCHY" && edge.slug === "dates";
    })[0].nodeOut;

    // YEARS
    edgesOutForEach(datesNode!, (edge) => {
        if (edge.type !== "ADDRESS_HIERARCHY") {
            return;
        }
        createDateDiv(edge);

        // MONTHS
        edgesOutForEach(edge.nodeOut!, (edge) => {
            if (edge.type !== "ADDRESS_HIERARCHY") {
                return;
            }
            createDateDiv(edge);

            // DAYS
            edgesOutForEach(edge.nodeOut!, (edge) => {
                if (edge.type !== "ADDRESS_HIERARCHY") {
                    return;
                }
                createDateDiv(edge);
            });
        });
    });

    // Ensure unique URLs for date entries
    const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let duplicateIndex = 0;
    let duplicateDateString = '';
    dateEntries.forEach((entry) => {
        const dateString = entry.dateString;
        if (dateString === duplicateDateString) {
            duplicateIndex++;
            console.log('Duplicate date string "' + dateString + '", using index ' + duplicateIndex);
        } else {
            duplicateDateString = dateString;
            duplicateIndex = 0;
        }
        let url = 'date-' + entry.dateString + (duplicateIndex === 0 ? '' : '-' + chars[duplicateIndex - 1]) + '.html';
        entry.url = url;
    }); 
}

const createIndexDatesSection = () => {
    let html = '';
    html += '<section class="dates">';

    dateEntries.forEach((entry) => {
        const aOpen = '<a href="' + entry.url + '"';
        const aClose = '</a>';

        const divOpen = '<div'
        const divClose = '</div>'

        const a = aOpen + entry.dateDiv.substring(divOpen.length, entry.dateDiv.length - divClose.length) + aClose;
        html += '\n' + a;
    }); 

    html += '</section>';
    return html;
}

// Prepare all events
collectDateEntries();

console.log('Total date entries: ' + dateEntries.length);

const indexHtml = await Bun.file('src/html/index.html').text();
const updatedIndexHtml = indexHtml.replace('<!--ARTICLE_DATA-->', createIndexDatesSection());
await Bun.write('docs/index.html', updatedIndexHtml);


// Clean up old date-*.html files
const cleanOldDateFiles = async () => {
    const cleanedFiles: string[] = [];
    const docFiles = await readdir('docs');
    for (let i = 0; i < docFiles.length; i++) {
        const file = docFiles[i];
        if (file.startsWith('date-') && file.endsWith('.html')) {
            cleanedFiles.push(file);
            await Bun.file('docs/' + file).delete();
        }
    }
    return cleanedFiles;
}

await cleanOldDateFiles();

const dateHtml = await Bun.file('src/html/date.html').text();

const createNewDateFields = async () => {
    const dateHumanToSpans = (dateHuman: string) => {
        const parts = dateHuman.split('.');
        return '<span>' + parts[0] + '.</span><span>' + parts[1] + '.</span><span>' + parts[2] + '</span>';
    }

    const entryToAnchor = (href: string, text: string) => {
        return '<a href="' + href+ '">' + text + '</a>';
    }

    for (let i = 0; i < dateEntries.length; i++) {
        const entry = dateEntries[i];
        const dateHuman = entry.dateHuman;
        let updatedDateHtml = dateHtml.split('<!--ARTICLE_DATA-->').join(entry.dateDiv);
        updatedDateHtml = updatedDateHtml.split('<!--DATE-->').join(dateHuman);
        updatedDateHtml = updatedDateHtml.split('<!--DATE_SPANS-->').join(dateHumanToSpans(dateHuman));
        updatedDateHtml = updatedDateHtml.split('<!--TITLE-->').join(entry.title);
        updatedDateHtml = updatedDateHtml.split('<!--KEYWORDS-->').join(entry.keywords.join(', '));

        const previousEntry = i > 0 ? dateEntries[i - 1] : null;
        const nextEntry = i < dateEntries.length - 1 ? dateEntries[i + 1] : null;

        if (previousEntry) {
            const previousAnchor = entryToAnchor( previousEntry.url, "Previous");
            updatedDateHtml = updatedDateHtml.split('<!--PREVIOUS-->').join(previousAnchor);
        }
        if (nextEntry) {
            const nextAnchor = entryToAnchor(nextEntry.url, "Next");
            updatedDateHtml = updatedDateHtml.split('<!--NEXT-->').join(nextAnchor);
        }

        await Bun.write('docs/' + entry.url, updatedDateHtml);
    }
}
await createNewDateFields();
