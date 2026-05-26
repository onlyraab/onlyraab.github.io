// Main TypeScript entry point

import { legacyParser } from '@mokick/core/legacy/parser';
import { edgesOutFilter, edgesOutForEach } from '@mokick/core/lists/edgesOutList';
import { Edge } from '@mokick/core/types/Edge';
import { StringNode } from '@mokick/core/types/StringNode';
import { mkdir, readdir, rmdir } from "node:fs/promises";
import legacyMokickGraph from '../../data/data/mokick-graph.json';
import { generateAllDateSocialImages } from './og/image-generate';
import { DateEntry } from './types/DateEntry';

const ddMmYyyyRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const dataIsoDateAttributeName = 'data-iso-date'

const dateDivMap = new Map<string, string[]>();
const dateOrder: string[] = [];



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

    html += '<div class="date" ' + dataIsoDateAttributeName + '="">';

    let dateIsoString = "";
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

            if (dateIsoString === "") {
                const match = valueString.match(ddMmYyyyRegex);
                if (match) {
                    const [, dd, mm, yyyy] = match;
                    var timestampDate = new Date();
                        timestampDate.setUTCFullYear(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));

                    const timestamp = timestampDate.getTime();
                    if (0 < timestamp) {
                        dateIsoString = timestampDate.toISOString().substring(0, 10);
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

    const hasDate = dateIsoString !== "";
    if (hasDate) {
        html = html.replace(dataIsoDateAttributeName + '=""', dataIsoDateAttributeName +'="' + dateIsoString + '"');
    }

    html += '</div>';

    if (hasDate) {
        const dateString = dateIsoString;
        if (!dateDivMap.has(dateString)) {
            dateDivMap.set(dateString, []);
            dateOrder.push(dateString);
        }
        const dateDivs = dateDivMap.get(dateString)!;
        dateDivs.push(html);

        dateEntries.push({
            url: '',
            ogImageUrl: '',
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
        let url = 'dates/' + entry.dateString + (duplicateIndex === 0 ? '' : '-' + chars[duplicateIndex - 1]) + '.html';
        entry.url = url;
        entry.ogImageUrl = "img/social/" + url.replace('.html', '.png');
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

await generateAllDateSocialImages(dateEntries);


const indexHtml = await Bun.file('src/html/index.html').text();
const updatedIndexHtml = indexHtml.replace('<!--ARTICLE_DATA-->', createIndexDatesSection());
await Bun.write('docs/index.html', updatedIndexHtml);


// Clean up old date-*.html files
const cleanOldDateFiles = async () => {
    const cleanedFiles: string[] = [];
    const oldDocFiles = await readdir('docs');
    for (let i = 0; i < oldDocFiles.length; i++) {
        const file = oldDocFiles[i];
        if (file.startsWith('date-') && file.endsWith('.html')) {
            cleanedFiles.push(file);
            await Bun.file('docs/' + file).delete();
        }
    }

    await rmdir('docs/dates', { recursive: true });
    await mkdir('docs/dates');

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
        return '<a href="/' + href+ '">' + text + '</a>';
    }

    for (let i = 0; i < dateEntries.length; i++) {
        const entry = dateEntries[i];
        const dateHuman = entry.dateHuman;
        let updatedDateHtml = dateHtml.split('<!--ARTICLE_DATA-->').join(entry.dateDiv);
        updatedDateHtml = updatedDateHtml.split('<!--DATE-->').join(dateHuman);
        updatedDateHtml = updatedDateHtml.split('<!--DATE_SPANS-->').join(dateHumanToSpans(dateHuman));
        updatedDateHtml = updatedDateHtml.split('<!--TITLE-->').join(entry.title);
        updatedDateHtml = updatedDateHtml.split('<!--URL-->').join(entry.url);
        updatedDateHtml = updatedDateHtml.split('<!--OG_IMAGE_URL-->').join(entry.ogImageUrl);
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

        await Bun.write("docs/" + entry.url, updatedDateHtml);

        // Keep old date files for now, as they might be linked from other pages. We can clean them up later after verifying the new ones work correctly.
        const oldFilePath = "docs/date-" + entry.url.substring("dates/".length);
        await Bun.write(oldFilePath, updatedDateHtml);
    }
}
await createNewDateFields();

const sitemapUrls = ["index.html"];
dateEntries.forEach((entry) => {
    sitemapUrls.push(entry.url);
});


    console.log('Sitemap URLs count: ' + sitemapUrls.length);

const createSitemap = async () => {
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const baseUrl = 'https://onlyraab.com/';
    const lastModified = new Date().toISOString().substring(0, 10);

    sitemapUrls.forEach((url) => {
        sitemapXml += '\t<url>\n';
        sitemapXml += '\t\t<loc>' + baseUrl + url + '</loc>\n';
        sitemapXml += '\t\t<lastmod>' + lastModified + '</lastmod>\n';
        sitemapXml += '\t</url>\n';
    });

    sitemapXml += '</urlset>\n';

    await Bun.write('docs/sitemap.xml', sitemapXml);
}

await createSitemap();