/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
//plotly
import Plotly from 'plotly.js-dist';
import ISelectionManager = powerbi.extensibility.ISelectionManager; import ISelectionId = powerbi.visuals.ISelectionId; import IVisualHost = powerbi.extensibility.visual.IVisualHost;


import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private host: IVisualHost;
    private selectionManager: ISelectionManager;

    constructor(options: VisualConstructorOptions) {

        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        console.log('Visual constructor', options);
        this.target = options.element;
        this.updateCount = 0;
        if (document) {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Hello World:"));
            const new_em: HTMLElement = document.createElement("em");
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);
        }
    }

    public update(options: VisualUpdateOptions) {
        let selectionManager = this.selectionManager;
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        if (this.textNode) {
            this.textNode.textContent = (this.updateCount++).toString();
        }

        let DV = options.dataViews
        let category = DV[0].categorical.categories[0];
        let vals = category.values;

        const map2 = vals.map(function (element, index) {
            let selectionId: ISelectionId = this.host.createSelectionIdBuilder()
                .withCategory(category, index)
                .createSelectionId();
            return [index, element, selectionId]
        }, this) //add index of value

        console.log(map2);

        var gd = document.querySelector('div');
        var data = [
            {
                name: "2018",
                type: "waterfall",
                orientation: "h",
                text: options.dataViews[0].categorical.values[0].values,
                y: options.dataViews[0].categorical.categories[0].values,
                x: options.dataViews[0].categorical.values[0].values,
                connector: {
                    mode: "between",
                    line: {
                        width: 4,
                        color: "rgb(0, 0, 0)",
                        dash: 0
                    }
                }
            }
        ];
        var layout = {
            title: {
                text: "Profit and loss statement 2018<br>waterfall chart displaying positive and negative"
            },
            yaxis: {
                type: "category",
                autorange: "reversed"
            },
            xaxis: {
                type: "linear"
            },
            margin: { l: 150 },
            showlegend: true
        }
        Plotly.newPlot(gd, data, layout);

        var d = document.querySelectorAll("g.cartesianlayer > g > g.plot > g > g > g.points > g");

        for (let i = 0; i < d.length; i++) {
            d[i].setAttribute("style", "pointer-events: all;");
            d[i].attributes[0].ownerElement["sid"] = map2[i][2];
            d[i].addEventListener('click', function emit(event) {              
                selectionManager.select(this.attributes[0].ownerElement["sid"]);

            });
        }




    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}