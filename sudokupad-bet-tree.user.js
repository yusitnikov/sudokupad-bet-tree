// ==UserScript==
// @name         SudokuPad Bet Tree
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Add a bet tree control to SudokuPad
// @author       Chameleon (+ theme by emckee2006)
// @updateURL    https://github.com/yusitnikov/sudokupad-bet-tree/raw/main/sudokupad-bet-tree.user.js
// @match        https://crackingthecryptic.com/*
// @match        https://*.crackingthecryptic.com/*
// @match        https://sudokupad.app/*
// @match        https://*.sudokupad.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=app.crackingthecryptic.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', () => {
    const treeMarker = 't';

    let autoIncrementId = 0;

    const renderTree = (renderer, scaleCoeff, offsetX, offsetY) => {
        const scale = (x) => x * scaleCoeff;
        const translateX = (x) => offsetX + scale(x);
        const translateY = (y) => offsetY + scale(y);
        const renderPath = (g, fill, points, opacity = 1, stroke = 'transparent', strokeWidth = 0) => g.appendChild(renderer.renderPart({
            type: 'path',
            attr: {
                fill,
                d: points
                .flatMap((args, commandIndex) => {
                    const type = typeof args[0] === "string" ? args.shift() : (commandIndex ? 'L' : 'M');

                    return [
                        type,
                        ...args.map((value, index) => index % 2 ? translateY(value) : translateX(value)),
                    ];
                })
                .join(' ') + ' Z',
                opacity,
                stroke,
                "stroke-width": scale(strokeWidth),
            }
        }))
        const renderCircle = (g, fill, cx, cy, r, opacity = 1) => renderPath(g, fill, [
            [cx, cy + r],
            ['Q', cx + r, cy + r, cx + r, cy],
            ['T', cx, cy - r],
            ['T', cx - r, cy],
            ['T', cx, cy + r],
        ], opacity);

        const themes = {
            default: (g, fill = '#0c0') => {
                g.appendChild(renderer.renderPart({
                    type: 'rect',
                    attr: {
                        fill: '#c80',
                        x: translateX(-0.25),
                        y: translateY(0.5),
                        width: scale(0.5),
                        height: scale(0.5),
                    }
                }));
                renderPath(g, fill, [
                    [0, -1],
                    [1, 0],
                    [0.5, 0],
                    [1, 0.5],
                    [-1, 0.5],
                    [-0.5, 0],
                    [-1, 0],
                ], 1, '#0c0', 0.05);
            },
            christmas: g => {
                themes.default(g);

                const ch = renderer.renderPart({type: 'g'});

                const renderToy = (fill, cx, cy, r) => {
                    renderCircle(ch, fill, cx, cy, r);
                    renderCircle(ch, '#fff', cx - r * 0.3, cy - r * 0.3, r * 0.3, 0.7);
                };
                const renderCurve = (points) => renderPath(ch, '#4e4', points);

                renderCurve([
                    [0.2, -0.8],
                    ['Q', 0, -0.6, -0.4, -0.6],
                    ['L', -0.45, -0.55],
                    ['Q', 0, -0.55, 0.24, -0.76],
                ]);
                renderCurve([
                    [0.5, -0.5],
                    ['Q', 0, -0.2, -0.82, -0.18],
                    ['L', -0.87, -0.13],
                    ['Q', 0, -0.15, 0.54, -0.46],
                ]);
                renderCurve([
                    [0.8, -0.2],
                    ['Q', 0, 0.2, -0.75, 0.25],
                    ['L', -0.8, 0.3],
                    ['Q', 0, 0.25, 0.84, -0.16],
                ]);
                renderCurve([
                    [0.75, 0.25],
                    ['Q', 0.4, 0.4, 0.05, 0.5],
                    ['L', 0.25, 0.5],
                    ['Q', 0.5, 0.4, 0.79, 0.29],
                ]);
                renderToy('#f00', -0.3, -0.5, 0.1);
                renderToy('#00f', 0.2, -0.55, 0.1);
                renderToy('#fc0', 0.1, -0.1, 0.1);
                renderToy('#f00', 0.6, -0.2, 0.1);
                renderToy('#00f', 0.3, 0.35, 0.1);
                renderToy('#fc0', 0.75, 0.3, 0.1);
                renderToy('#f00', -0.2, 0.3, 0.1);
                renderToy('#00f', -0.45, -0.05, 0.1);
                renderToy('#fc0', -0.65, 0.4, 0.1);
                renderPath(ch, '#fd0', [
                    [0, -1.333],
                    [0.196, -0.73],
                    [-0.317, -1.103],
                    [0.317, -1.103],
                    [-0.196, -0.73],
                ]);
                renderCircle(ch, '#fff', -0.03, -1.02, 0.03, 0.7);
                g.appendChild(ch);
            },
            // Theme idea and design by emckee2006
            trans_pride: g => {
                const defs = renderer.renderPart({type: 'defs'});
                const gradientId = 'trans-flag-grad' + (++autoIncrementId);
                defs.innerHTML = `
                    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#5BCEFA"></stop>
                        <stop offset="20%" stop-color="#5BCEFA"></stop>
                        <stop offset="20%" stop-color="#F5A9B8"></stop>
                        <stop offset="40%" stop-color="#F5A9B8"></stop>
                        <stop offset="40%" stop-color="#FFF"></stop>
                        <stop offset="60%" stop-color="#FFF"></stop>
                        <stop offset="60%" stop-color="#F5A9B8"></stop>
                        <stop offset="80%" stop-color="#F5A9B8"></stop>
                        <stop offset="80%" stop-color="#5BCEFA"></stop>
                        <stop offset="100%" stop-color="#5BCEFA"></stop>
                    </linearGradient>
                `;
                g.appendChild(defs);
                themes.default(g, `url(#${gradientId})`);
            },
        };

        const g = renderer.renderPart({target: 'cell-pen', type: 'g'});
        for (const [themeName, themeRenderFn] of Object.entries(themes)) {
            const themedContainer = renderer.renderPart({type: 'g'});
            themedContainer.classList.add('bettree-themed');
            themedContainer.classList.add('bettree-theme-' + themeName);
            themeRenderFn(themedContainer);
            g.appendChild(themedContainer);
        }

        return g;
    };

    const treeIcon = renderTree(
        {
            renderPart({type, attr = {}}) {
                const el = document.createElement(type);
                for (const [key, value] of Object.entries(attr)) {
                    el.setAttribute(key, value);
                }
                return el;
            }
        },
        6,
        12,
        12
    );

    const ToolBetTree = {
        button: {
            name: 'bettree',
            title: 'Bet Tree',
            content: `<div class="icon">
				<svg title="Bet Tree" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
					<path d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
					${treeIcon.innerHTML}
				</svg>
			</div>Bet Tree`,
        },
        tool: {
            name: 'bettree',
            isTool: true,
            actionLong: 'bettree',
            actionShort: 'bt',
            cellHasTree: function(cell) {
                return cell.pen.find(p => p[0] === treeMarker) !== undefined;
            },
            getCellHighlightsElement() {
                return Framework.app.svgRenderer.getElem().querySelector('#cell-highlights');
            },
            handleToolEnter: function() {
                this.getCellHighlightsElement().setAttribute('opacity', 0);
            },
            handleToolExit: function() {
                this.getCellHighlightsElement().removeAttribute('opacity');
            },
            handleInputdown: function() {
                const {app} = Framework;
                const {x, y} = app.inputPos;
                const {r, c} = app.xyToRC(x, y);
                const cell = app.grid.getCell(r, c);
                const hasTree = this.cellHasTree(cell);
                const treeCells = hasTree ? [] : app.grid.cells.flat().filter(cell => this.cellHasTree(cell));

                app.act({type: 'groupstart'});
                app.act({type: 'deselect'});
                app.act({type: 'select', arg: [cell, ...treeCells]});
                app.act({type: 'pen', arg: treeMarker});
                app.act({type: 'deselect'});
                app.act({type: 'groupend'});
            }
        }
    };

    let initialized = false;
    function init() {
        if (initialized) {
            return;
        }
        initialized = true;

        const coreRenderPen = Framework.app.svgRenderer.renderPen;
        Framework.app.svgRenderer.renderPen = function(opts = {}) {
            const {row, col, className, value} = opts;

            if (value !== treeMarker) {
                return coreRenderPen.call(this, opts);
            }

            return renderTree(
                this,
                0.3 * SvgRenderer.CellSize,
                (col + 0.5) * SvgRenderer.CellSize,
                (row + 0.5) * SvgRenderer.CellSize
            );
        };

        const themeSetting = {
            tag: 'multi',
            group: 'visual',
            name: 'bettree_theme',
            content: 'Bet Tree Theme',
            options: [
                {value: 'default', content: 'Default'},
                {value: 'christmas', content: 'Christmas'},
                // Theme idea and design by emckee2006
                {value: 'trans_pride', content: 'Trans Pride'},
            ],
            init: () => {
                const validThemes = themeSetting.options.map(option => option.value);
                if (!validThemes.includes(Framework.settings[themeSetting.name])) {
                    Framework.toggleSettingClass(themeSetting.name, validThemes[0]);
                    Framework.setSetting(themeSetting.name, validThemes[0]);
                }
            }
        };
        Framework.addSetting(themeSetting);

        const style = document.createElement('style');
        style.innerHTML = `
		   .controls-main.tool-bettree .controls-input { opacity: 0; pointer-events: none; }

		   .bettree-themed { display: none; }

		   ${themeSetting.options.map(({value}) => `body.setting-${themeSetting.name}-${value} .bettree-themed.bettree-theme-${value} { display: initial; }`).join('\n')}
		`;
        document.head.appendChild(style);

        setTimeout(() => addTool(ToolBetTree), 10);
    }

    if (typeof Framework !== "undefined") {
        if (Framework.app) {
            init();
        } else {
            const coreStart = window.start;
            window.start = () => {
                coreStart();
                init();
            }
        }
    }
});
