// Main TypeScript entry point

import { legacyParser } from '@mokick/core/legacy/parser';
import { edgesOutFilter, edgesOutForEach } from '@mokick/core/lists/edgesOutList';
import { Edge } from '@mokick/core/types/Edge';
import { StringNode } from '@mokick/core/types/StringNode';
import legacyMokickGraph from '../../data/data/mokick-graph.json';

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

    html += '<div class="date">';

    edgesOutForEach(textContentEdges[0].nodeOut!, (e: Edge) => {
        const slug = e.slug!;

        if (slug.startsWith("p-")) {

            html += '<p>' + (e.nodeOut! as StringNode).valueString + '</p>';
        }
        else if (slug.startsWith("h-")) {

            let h = slug === "h-0" ? "h3" : slug === "h-1" ? "h4" : "h5";
            html += '<' + h + '>' + (e.nodeOut! as StringNode).valueString + '</' + h + '>'
        }
        else if (slug.startsWith("list-")) {

            html += '<ul>';

            edgesOutForEach(e.nodeOut!, (e) => {
                html += '<li>' + (e.nodeOut! as StringNode).valueString + '</li>';
            });
            html += '</ul>';
        }
    });

    html += '</div>';

    return '\n' + html;
}

const createDatesSection = () => {
    let html = '';

    html += '<section class="dates">';

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
        html += createDateDiv(edge);

        // MONTHS
        edgesOutForEach(edge.nodeOut!, (edge) => {
            if (edge.type !== "ADDRESS_HIERARCHY") {
                return;
            }
            html += createDateDiv(edge);

            // DAYS
            edgesOutForEach(edge.nodeOut!, (edge) => {
                if (edge.type !== "ADDRESS_HIERARCHY") {
                    return;
                }
                html += createDateDiv(edge);
            });
        });
    });

    html += '</section>';

    return html;
}

const indexHtml = await Bun.file('src/html/index.html').text();
const updatedIndexHtml = indexHtml.replace('<!--ARTICLE_DATA-->', createDatesSection());
await Bun.write('docs/index.html', updatedIndexHtml);
