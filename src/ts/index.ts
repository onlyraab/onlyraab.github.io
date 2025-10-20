// Main TypeScript entry point

import { legacyParser } from '@mokick/core/legacy/parser';
import { edgesOutFilter, edgesOutForEach } from '@mokick/core/lists/edgesOutList';
import { Edge } from '@mokick/core/types/Edge';
import { StringNode } from '@mokick/core/types/StringNode';
import legacyMokickGraph from '../../data/data/mokick-graph.json';

const createDateDiv = (edge: Edge) => {
    const contentEdges = edgesOutFilter(edge.nodeOut!, (e: Edge) => e.type === "CONTENT");
    if (contentEdges.length !== 1) {
        return null;
    }

    const contentNode = contentEdges[0].nodeOut!;
    const textContentEdges = edgesOutFilter(contentNode, (e: Edge) => e.slug === "text");
    if (textContentEdges.length !== 1) {
        return null;
    }

    const dateDiv = document.createElement('div');
    dateDiv.className = "date";

    edgesOutForEach(textContentEdges[0].nodeOut!, (e: Edge) => {
        const slug = e.slug!;

        if (slug.startsWith("p-")) {

            const p = document.createElement("p");
            p.textContent = (e.nodeOut! as StringNode).valueString;
            dateDiv.appendChild(p);
        }
        else if (slug.startsWith("h-")) {

            let h = slug === "h-0" ? "h3" : slug === "h-1" ? "h4" : "h5";
            const h1 = document.createElement(h);
            h1.textContent = (e.nodeOut! as StringNode).valueString;
            dateDiv.appendChild(h1);
        }
        else if (slug.startsWith("list-")) {

            const ul = document.createElement("ul");
            edgesOutForEach(e.nodeOut!, (e) => {
                const li = document.createElement("li");
                li.textContent = (e.nodeOut! as StringNode).valueString;
                ul.appendChild(li);
            });
            dateDiv.appendChild(ul);
        }
    });

    return dateDiv;
}

const createDatesSection = () => {

    const datesSection = document.createElement('section');
    datesSection.className = "dates";

    
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
        const dateDiv = createDateDiv(edge);
        if (dateDiv) {
            datesSection.appendChild(dateDiv);
        }

        // MONTHS
        edgesOutForEach(edge.nodeOut!, (edge) => {
            if (edge.type !== "ADDRESS_HIERARCHY") {
                return;
            }
            const dateDiv = createDateDiv(edge);
            if (dateDiv) {
                datesSection.appendChild(dateDiv);
            }

            // DAYS
            edgesOutForEach(edge.nodeOut!, (edge) => {
                if (edge.type !== "ADDRESS_HIERARCHY") {
                    return;
                }
                const dateDiv = createDateDiv(edge);
                if (dateDiv) {
                    datesSection.appendChild(dateDiv);
                }
            });
        });
    });

    return datesSection;
}

// Example of using the function
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(createDatesSection());
});

