import { createElement } from '@syncfusion/ej2-base';
import { Diagram } from '../../../src/diagram/diagram';
import { ConnectorModel } from '../../../src/diagram/objects/connector-model';
import { NodeModel } from '../../../src/diagram/objects/node-model';
import { DiagramScroller } from '../../../src/diagram/interaction/scroller';
import { UndoRedo } from '../../../src/diagram/objects/undo-redo';
import { Snapping } from '../../../src/diagram/objects/snapping';
import { MouseEvents } from '../../../spec/diagram/interaction/mouseevents.spec';
import { DiagramContextMenu } from '../../../src/diagram/objects/context-menu';
import { Node, SnapSettingsModel, DiagramElement, ShapeAnnotationModel, PointPortModel, Connector } from '../../../src/diagram/index';
import { SnapConstraints, PortVisibility, PortConstraints, AnnotationConstraints } from '../../../src/diagram/enum/enum';
import { MenuItemModel } from '@syncfusion/ej2-navigations';
import { profile, inMB, getMemoryProfile } from '../../../spec/common.spec';
Diagram.Inject(UndoRedo, DiagramContextMenu, Snapping);
/**
 * Groups Spec
 */
describe('Group', () => {

    describe('Group', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 100, height: 100, offsetX: 100,
                    offsetY: 200,
                }, {
                    id: 'node2', width: 200, height: 100, offsetX: 400,
                    offsetY: 400
                },
                {
                    id: 'node3', width: 100, height: 100, offsetX: 700,
                    offsetY: 400
                },
                { id: 'group', children: ['node1', 'node2', 'connector1'] },
                { id: 'group2', children: ['node3', 'group'] }];
            let connector: ConnectorModel = {
                id: 'connector1', sourceID: 'node1', targetID: 'node2'
            };
            let connector2: ConnectorModel = {
                id: 'connector2', sourceID: 'group', targetID: 'node3'
            };

            diagram = new Diagram({
                width: '1500px', height: '600px', nodes: nodes,
                connectors: [connector, connector2],
                snapSettings: { constraints: 0 }, contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('select group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.selectAll();
            expect(diagram.selectedItems.nodes.length).toBe(1);
            diagram.clearSelection();
            done();
        });
        it('Group With Default', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 275, 300);
            mouseEvents.mouseMoveEvent(diagramCanvas, 400, 400);
            //check size too
            expect(diagram.selectedItems.nodes[0].wrapper.offsetX === 400 &&
                diagram.selectedItems.nodes[0].wrapper.offsetY === 300).toBe(true);
            done();
        });
        it('Scale the group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 700, 300);
            mouseEvents.mouseMoveEvent(diagramCanvas, 749, 299);
            mouseEvents.mouseDownEvent(diagramCanvas, 749, 299);
            mouseEvents.mouseMoveEvent(diagramCanvas, 800, 300);
            mouseEvents.mouseUpEvent(diagramCanvas, 800, 300);
            diagram.undo();
            //check not proper - have to check size
            expect(diagram.selectedItems.nodes[0].wrapper.offsetX === 400 &&
                diagram.selectedItems.nodes[0].wrapper.offsetY === 300).toBe(true);
            done();
        });
        it('Drag the group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 700, 300);
            mouseEvents.mouseDownEvent(diagramCanvas, 700, 300);
            mouseEvents.mouseMoveEvent(diagramCanvas, 750, 250);
            mouseEvents.mouseUpEvent(diagramCanvas, 750, 250);
            expect(diagram.selectedItems.nodes[0].wrapper.offsetX === 450 &&
                diagram.selectedItems.nodes[0].wrapper.offsetY === 250).toBe(true);
            done();
            diagram.undo();
        });
        it('Background color for the group', (done: Function) => {
            diagram.nodes[2].backgroundColor = 'blue';
            diagram.nodes[3].backgroundColor = 'red';
            diagram.dataBind();
            //check not proper
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            expect(diagram.selectedItems.nodes[0].backgroundColor).toBe('transparent');
            done();
            diagram.clearSelection();
        });
        it('Multiple selection restriction for the group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.clickEvent(diagramCanvas, 100, 200, true);
            expect(diagram.selectedItems.nodes.length).toBe(1);
            done();
            diagram.clearSelection();
        });
        it('Delete the group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 275, 300);
            diagram.remove();
            expect(diagram.nodes.length).toBe(0);
            diagram.undo();
            expect(diagram.nodes.length).toBe(5);
            diagram.clearSelection();
            done();
        });
        it('Delete the child from the group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            diagram.remove();
            expect(diagram.nodes.length).toBe(4);

            diagram.undo();
            expect(diagram.nodes.length).toBe(5);
            done();
        });

        it('Copy paste the multilevel group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            diagram.copy();
            expect(Object.keys(diagram.nameTable).length).toBe(7);
            //2 groups,1 connector, 3 nodes so 7+6 =13
            diagram.paste();
            expect(Object.keys(diagram.nameTable).length).toBe(13);
            diagram.cut();
            expect(Object.keys(diagram.nameTable).length).toBe(7);
            diagram.paste();
            expect(Object.keys(diagram.nameTable).length).toBe(13);
            diagram.undo();
            expect(Object.keys(diagram.nameTable).length).toBe(7);
            diagram.redo();
            expect(Object.keys(diagram.nameTable).length).toBe(13);
            done();
        });
    });
    describe('Group With context Menu', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();
        let group: NodeModel = { id: 'group2', children: ['node3', 'node4'] };
        let node6: NodeModel = {
            width: 100, height: 100, offsetX: 950,
            offsetY: 100
        };

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourceID: 'node1', targetID: 'node2'
            };
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 100, height: 100, offsetX: 100,
                    offsetY: 200,
                }, {
                    id: 'node2', width: 200, height: 100, offsetX: 400,
                    offsetY: 400
                },
                {
                    id: 'node3', width: 100, height: 100, offsetX: 700,
                    offsetY: 400
                },
                {
                    id: 'node4', width: 100, height: 100, offsetX: 950,
                    offsetY: 300
                },
                {
                    id: 'node5', width: 100, height: 100, offsetX: 950,
                    offsetY: 600
                },
            ];

            diagram = new Diagram({
                width: '1500px', height: '600px', nodes: nodes,
                connectors: [connector],
                snapSettings: { constraints: 0 }, contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram');
            diagram.add(group);

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Add Child as string to the  group', (done: Function) => {
            diagram.addChild(group, 'node5');
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(3);
                }
            }
            done();
        });
        it('Add Child as Object to the  group', (done: Function) => {
            diagram.addChild(group, node6);
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(4);
                }
            }
            done();
        });
        it('Add Child as string to the  group which is not in name table', (done: Function) => {
            diagram.addChild(group, 'xxx');
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(4);
                }
            }
            done();
        });
        it('Add Child to the node which does not have any children', (done: Function) => {
            diagram.addChild(node6, 'xxx');
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(4);
                }
            }
            done();
        });
        it('Delete Child from the node as string', (done: Function) => {
            diagram.deleteChild('node5', group);
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(3);
                }
            }
            done();
        });
        it('Delete Child from the node  as Object', (done: Function) => {
            diagram.deleteChild('xxx', node6);
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(3);
                }
            }
            done();
        });
        it('Delete Child from the Group  as Object', (done: Function) => {
            diagram.deleteChild(node6, group);
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(3);
                }
            }
            done();
        });
        it('Context Menu - Group', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 100, 200);
            mouseEvents.clickEvent(diagramCanvas, 400, 400, true);
            (diagram.contextMenuModule as any).eventArgs = { target: document.getElementById('diagramdraw_diagramAdorner_svg') };
            let e = {
                event: (diagram.contextMenuModule as any).eventArgs,
                items: (diagram.contextMenuModule.contextMenu.items[6] as MenuItemModel).items,
            };
            for (let i of e.items) {
                if (i.id ===
                    diagram.contextMenuModule.contextMenu.element.id + '_' + 'group') {
                    (diagram.contextMenuModule as any).contextMenuBeforeOpen(e);
                    (diagram.contextMenuModule as any).contextMenuOpen();
                    (diagram.contextMenuModule as any).contextMenuItemClick({ item: i });
                    (diagram.contextMenuModule as any).contextMenuOnClose(e);
                    break;
                }
            }
            diagram.clearSelection();
            expect(diagram.nodes.length).toBe(8);
            diagram.undo();
            expect(diagram.nodes.length).toBe(7);
            diagram.redo();
            expect(diagram.nodes.length).toBe(8);
            done();
        });
        it('Context Menu - Ungroup', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 200, 200);
            (diagram.contextMenuModule as any).eventArgs = { target: document.getElementById('diagramdraw_diagramAdorner_svg') };
            let e = {
                event: (diagram.contextMenuModule as any).eventArgs,
                items: (diagram.contextMenuModule.contextMenu.items[6] as MenuItemModel).items,
            };
            for (let i of e.items) {
                if (i.id ===
                    diagram.contextMenuModule.contextMenu.element.id + '_' + 'unGroup') {
                    (diagram.contextMenuModule as any).contextMenuBeforeOpen(e);
                    (diagram.contextMenuModule as any).contextMenuOpen();
                    (diagram.contextMenuModule as any).contextMenuItemClick({ item: i });
                    (diagram.contextMenuModule as any).contextMenuOnClose(e);
                    break;
                }
            }
            diagram.clearSelection();
            expect(diagram.nodes.length).toBe(7);
            diagram.undo();
            expect(diagram.nodes.length).toBe(8);
            diagram.redo();
            expect(diagram.nodes.length).toBe(7);
            done();
        });

        it('Ungroup - Internal Group', (done: Function) => {
            diagram.add({ id: 'group1', children: ['node1', 'group2'] });
            expect(diagram.nodes.length).toBe(8);
            expect((diagram.nameTable['group1'] as Node).children.length).toBe(2);
            let internalGroup = diagram.nameTable['group2'];
            expect((internalGroup as Node).parentId).toBe('group1');
            diagram.select([internalGroup]);
            diagram.unGroup();
            expect(diagram.nodes.length).toBe(7);
            expect((diagram.nameTable['group1'] as Node).children.length).toBe(1);
            done();
        });
    });
    describe('Add child to the group', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();
        let group: NodeModel = { id: 'group2', children: ['node3', 'node4'] };
        let node6: NodeModel = {
            width: 100, height: 100, offsetX: 950,
            offsetY: 100
        };

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourceID: 'node1', targetID: 'node2'
            };
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 100, height: 100, offsetX: 100,
                    offsetY: 200,
                }, {
                    id: 'node2', width: 200, height: 100, offsetX: 400,
                    offsetY: 400
                },
                {
                    id: 'node3', width: 100, height: 100, offsetX: 700,
                    offsetY: 400
                },
                {
                    id: 'node4', width: 100, height: 100, offsetX: 950,
                    offsetY: 300
                },
                {
                    id: 'node5', width: 100, height: 100, offsetX: 950,
                    offsetY: 600
                },
            ];

            diagram = new Diagram({
                width: '1500px', height: '600px', nodes: nodes,
                connectors: [connector],
                snapSettings: { constraints: 0 }, contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram');
            diagram.add(group);

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Add Child as string to the  group', (done: Function) => {
            diagram.addChildToGroup(group, 'node5');
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(3);
                }
            }
            done();
        });
        it('Add Child as Object to the  group', (done: Function) => {
            diagram.addChildToGroup(group, node6);
            for (let i: number = 0; i < diagram.nodes.length; i++) {
                if (diagram.nodes[i].id === 'group') {
                    expect(diagram.nodes[i].children.length).toBe(4);
                }
            }
            done();
        });
    });
    describe('Diagram with element pass as parameter', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();
        let group: NodeModel = { id: 'group2', children: ['node3', 'node4'] };
        let node6: NodeModel = {
            width: 100, height: 100, offsetX: 950,
            offsetY: 100
        };

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let connector: ConnectorModel = {
                id: 'connector1', sourceID: 'node1', targetID: 'node2'
            };
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 100, height: 100, offsetX: 100,
                    offsetY: 200,
                }, {
                    id: 'node2', width: 200, height: 100, offsetX: 400,
                    offsetY: 400
                },
                { id: 'group', children: ['node1', 'node2'], }
            ];

            let snapSettings: SnapSettingsModel = {
                snapObjectDistance: 5,
                constraints: (SnapConstraints.SnapToObject | SnapConstraints.SnapToLines) | SnapConstraints.ShowLines
            };

            diagram = new Diagram({
                width: '1000px', height: '500px', nodes: nodes,
                connectors: [connector],
                snapSettings: snapSettings, contextMenuSettings: { show: true }
            }, '#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Copy paste - group', (done: Function) => {

            let offsetX = diagram.nodes[2].offsetX;
            let offsetY = diagram.nodes[2].offsetY;
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, offsetX, offsetY);
            diagram.copy();
            diagram.paste();
            expect(diagram.nodes.length).toBe(6);
            diagram.undo();
            expect(diagram.nodes.length).toBe(3);
            diagram.redo();
            expect(diagram.nodes.length).toBe(6);
            expect(diagram.nodes[5].offsetX).toBe(offsetX + 10);
            expect(diagram.nodes[5].offsetY).toBe(offsetY + 10);
            done();
        });
    });
    describe('Group with annnotation', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 100, height: 100, offsetX: 100,
                    ports: [{ id: 'port1', visibility: PortVisibility.Visible }],
                    offsetY: 200,
                }, {
                    id: 'node2', width: 200, height: 100, offsetX: 400,
                    offsetY: 400
                },
                {
                    id: 'node3', width: 100, height: 100, offsetX: 700,
                    offsetY: 400
                },
                { id: 'group', children: ['node1', 'node2'] },
                { id: 'group2', children: ['node3', 'group'] }
            ];
            let connector: ConnectorModel = {
                id: 'connector1', sourceID: 'node1', targetID: 'node2'
            };
            let connector2: ConnectorModel = {
                id: 'connector2', sourceID: 'group', targetID: 'node3'
            };

            diagram = new Diagram({
                width: '1000px', height: '600px', nodes: nodes,
                snapSettings: { constraints: 0 },
                contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Group With Default along with annotation rotate', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 275, 300);
            mouseEvents.dblclickEvent(diagramCanvas, 400, 400);
            (document.getElementById(diagram.element.id + '_editBox') as HTMLTextAreaElement).value = 'Text';
            //check size too
            expect(diagram.selectedItems.nodes[0].wrapper.offsetX === 400 &&
                diagram.selectedItems.nodes[0].wrapper.offsetY === 300).toBe(true);
            mouseEvents.clickEvent(diagramCanvas, 10, 10);
            mouseEvents.clickEvent(diagramCanvas, 275, 300);
            mouseEvents.clickEvent(diagramCanvas, 275, 300);
            mouseEvents.dragAndDropEvent(diagramCanvas, 275, 120, 200, 150);

            expect(Math.round(diagram.selectedItems.nodes[0].wrapper.children[2].parentTransform) === 331 || Math.ceil(diagram.selectedItems.nodes[0].wrapper.children[2].parentTransform) === 334).toBe(true);
            mouseEvents.clickEvent(diagramCanvas, 10, 10);
            mouseEvents.clickEvent(diagramCanvas, 100, 300);
            expect(diagram.selectedItems.nodes[0].id === 'group2').toBe(true);
            done();
        });

        it('Rotated Group', (done: Function) => {
            diagram.select([diagram.nameTable['group2']]);
            let copiedObject = diagram.copy();
            copiedObject[0].rotateAngle = 45;
            diagram.paste(copiedObject as object[]);
            expect(Math.round(diagram.nodes[diagram.nodes.length - 2].rotateAngle) == 16 || Math.round(diagram.nodes[diagram.nodes.length - 2].rotateAngle) == 18 ).toBe(true);
            done();
        });
    });
    describe('Group with crash issue', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 100, height: 100, offsetX: 100,
                    ports: [{ id: 'port1', visibility: PortVisibility.Visible }],
                    offsetY: 200,
                }, {
                    id: 'node2', width: 200, height: 100, offsetX: 400,
                    offsetY: 400
                },

                {
                    id: 'group', children: ['node1', 'node2'], ports: [{
                        id: 'port22', constraints: PortConstraints.Drag,
                        visibility: PortVisibility.Visible, offset: { x: 0, y: 0 }
                    },
                    {
                        id: 'port222', constraints: PortConstraints.Drag,
                        visibility: PortVisibility.Visible, offset: { x: 1, y: 1 }
                    }],
                },

            ];

            diagram = new Diagram({
                width: '1000px', height: '600px', nodes: nodes, mode: 'SVG',
                snapSettings: { constraints: 0 },
                contextMenuSettings: { show: true },
            });
            diagram.appendTo('#diagram');

        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });

        it('Group With crash issue while select all', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            diagram.add({ id: 'node', width: 50, height: 50, offsetX: 100, offsetY: 100 });
            diagram.selectAll();
            expect(diagram.selectedItems.nodes.length === 2).toBe(true);
            done();
        });
        it('Drag GroupPort and drag child node of the group ', (done: Function) => {
            let diagramCanvas: HTMLElement = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 10, 10);
            
            let portelement = document.getElementById('group_port22');
            let bounds: DOMRect | ClientRect = portelement.getBoundingClientRect();
            mouseEvents.dragAndDropEvent(diagramCanvas, (bounds as DOMRect).x + (bounds as DOMRect).width / 2, (bounds as DOMRect).y + (bounds as DOMRect).height / 2, 70, 170);
            console.log('diagram.nodes[2].ports[0].offset.x: +' + diagram.nodes[2].ports[0].offset.x);
            console.log('diagram.nodes[2].ports[0].offset.y: +' + diagram.nodes[2].ports[0].offset.y);
            expect((((diagram.nodes[2].ports[0].offset.x) === 0.02666666666666667) || Math.ceil(diagram.nodes[2].ports[0].offset.x) === 1) &&
                    (diagram.nodes[2].ports[0].offset.y === 0.06666666666666667 || Math.ceil(diagram.nodes[2].ports[0].offset.y) === 1) ).toBe(true);
            mouseEvents.clickEvent(diagramCanvas, 10, 10);
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.clickEvent(diagramCanvas, 400, 400);
            mouseEvents.dragAndDropEvent(diagramCanvas, 400, 400, 450, 450);
            let element = document.getElementById('group_port222')
            console.log('element.attributes[2].value: ' + element.attributes[2].value);
            expect(element.attributes[2].value === 'rotate(0,550.5,500.5)translate(544.5,494.5)' || element.attributes[2].value === 'rotate(0,550.5033333333333,500.4977778042334)translate(544.5033333333333,494.4977778042334)').toBe(true);
            done()
        });
    });
    describe('Group - width and height', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_group_width_height' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node1', offsetX: 450, offsetY: 150, width: 100, height: 100,
                }, {
                    id: 'node2', width: 100, height: 100, offsetX: 550, offsetY: 250,
                }, {
                    id: 'group', ports: [{ id: 'port1', visibility: PortVisibility.Visible, shape: 'Circle', offset: { x: 0, y: 0.5 } }],
                    children: ['node1', 'node2'], style: { fill: 'gray', strokeColor: "black" }, rotateAngle: 0, width: 40, height: 40
                }
            ];

            diagram = new Diagram({
                width: '800px', height: '600px', nodes: nodes,
                snapSettings: { constraints: 0 }, contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram_group_width_height');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking group have width and height in rendering', (done: Function) => {
            expect(Math.round(diagram.nodes[0].width) === 20 && Math.round(diagram.nodes[0].height) === 20 &&
                Math.round(diagram.nodes[1].width) === 20 && Math.round(diagram.nodes[1].height) === 20 &&
                diagram.nodes[2].width === 40 && diagram.nodes[2].height === 40 &&
                diagram.nodes[2].offsetX === 500 && diagram.nodes[2].offsetY === 200).toBe(true);
            done();
        });
        it('Update group width and height at run time', (done: Function) => {
            var group1 = diagram.nodes[2];
            group1.width = 100;
            group1.height = 100;
            diagram.dataBind();
            expect(Math.round(diagram.nodes[0].width) === 50 && Math.round(diagram.nodes[0].height) === 50 &&
                Math.round(diagram.nodes[1].width) === 50 && Math.round(diagram.nodes[1].height) === 50 &&
                diagram.nodes[2].width === 100 && diagram.nodes[2].height === 100 &&
                diagram.nodes[2].offsetX === 500 && diagram.nodes[2].offsetY === 200).toBe(true);
            done();
        });
        it('group property issue and save and load isse', (done: Function) => {
            let element: HTMLElement = document.getElementById("group_groupElement");
            let group: HTMLElement = element.childNodes[0] as HTMLElement;
            expect(group.attributes[14].value === "gray" && group.attributes[11].value === "black").toBe(true);
            let savedata = diagram.saveDiagram();
            var group1 = diagram.nodes[2];
            diagram.scale(group1, 1.2, 1.2, { x: 0, y: 0.5 });
            var groupNode = diagram.nodes[2];
            expect(groupNode.width === 120 && groupNode.height === 120).toBe(true);
            done();
        })
        it('add and remove label issue', (done: Function) => {
            let group1 = diagram.nodes[2] as Node;
            let label: ShapeAnnotationModel[] = [{ id: 'label1', content: 'Label1', offset: { x: 0.5, y: 0.5 } },]
            diagram.addLabels(group1, label);
            let element: HTMLElement = document.getElementById("group_label1_groupElement");
            expect((element.childNodes.length > 0)).toBe(true);
            diagram.removeLabels(group1, label);
            let element1 = document.getElementById("group_label1_groupElement");
            expect(!(element1.childNodes.length > 0)).toBe(true);
            done();
        })
        it('remove Port issue', (done: Function) => {
            let group1 = diagram.nodes[2] as Node;
            let port: PointPortModel[] = [
                { id: 'port1', }, { id: 'port2', }, { id: 'port3', }, { id: 'port4', }
            ]
            let element: HTMLElement = document.getElementById("group_port1_groupElement");
            expect((element.childNodes.length > 0)).toBe(true);
            diagram.removePorts(group1, port);
            var element1 = document.getElementById("group_port1_groupElement")
            expect(!(element1.childNodes.length > 0)).toBe(true);
            done();
        })
    });
    describe('Group - width and height', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_group_group_width_height' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node6', width: 50, height: 50, offsetX: 750,
                    offsetY: 100
                },
                {
                    id: 'node7', width: 50, height: 50, offsetX: 750,
                    offsetY: 170
                },
                {
                    id: 'node8', width: 50, height: 50, offsetX: 850,
                    offsetY: 100
                },

                { id: 'group4', children: ['node6', 'node7'], },
                { id: 'group5', children: ['group4', 'node8'], },
            ];

            diagram = new Diagram({
                width: '800px', height: '600px', nodes: nodes,
                scrollSettings: { verticalOffset: 20 },
                snapSettings: { constraints: 0 }, contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram_group_group_width_height');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking group have width and height in rendering', (done: Function) => {
            expect(diagram.nodes[3].width == 50 && diagram.nodes[3].height == 120 &&
                diagram.nodes[3].offsetX == 750 && diagram.nodes[3].offsetY == 135).toBe(true);
            diagram.nodes[4].offsetX = 500;
            diagram.nodes[4].offsetY = 500;
            diagram.nodes[4].width = 200;
            diagram.nodes[4].height = 200;
            diagram.dataBind();
            expect(diagram.nodes[3].offsetX == 733.3299999999999 && diagram.nodes[3].offsetY == 135).toBe(true);
            done();
        });
        it('Checking group have width and height in rendering', (done: Function) => {
            let data
            let selArray = [];
            selArray.push(diagram.nodes[3]);
            diagram.select(selArray);
            let selectorElement = document.getElementById('diagram_group_group_width_height_SelectorElement');
            var children = selectorElement.children[3] as HTMLElement
            expect(children.getAttribute('cx') === '699.9966666666667').toBe(true)
            data = diagram.selectedItems.nodes;
            diagram.paste(data);

            expect(diagram.nodes.length === 8).toBe(true);
            done();
        });
    });
    describe('Performance Fix break issue', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_group_group_width_height' });
            document.body.appendChild(ele);
            var newnode = {
                offsetX: 250,
                offsetY: 250,
                width: 100,
                height: 100,
                shape: {
                    type: "Basic",
                    shape: "Triangle"
                },
                style: {
                    fill: '#6BA5D7',
                    strokeColor: 'white'
                },
                annotations: [
                    { content: "ssss",
                    constraints: AnnotationConstraints.Interaction,
                        style: { fill: "transparent" } }
                ]
            };
            var nodes = [
                {
                    id: 'node1', width: 50, height: 50, offsetX: 600,
                    offsetY: 300,
                }, {
                    id: 'node2', width: 50, height: 50, offsetX: 600,
                    offsetY: 400
                },
                { id: 'group', children: ['node1', 'node2'], rotateAngle: 45 },
            ];
            var connectors:ConnectorModel = {
                id: 'connector2',
                type: 'Straight',
                sourcePoint: { x: 300, y: 100 },
                targetPoint: { x: 400, y: 200 },
                annotations: [{ content: 'tecp' }],
                sourceDecorator: {
                    style: { fill: 'black' },
                    shape: 'Diamond',
                    pivot: { x: 0, y: 0.5 }
                },
                targetDecorator: {
                   // shape: 'None',
                    style: { fill: 'blue' },
                    pivot: { x: 0, y: 0.5 }
                }
            };
            diagram = new Diagram({
                width: '800px', height: '500px',nodes: nodes,
                connectors: [connectors],
            });
            diagram.appendTo('#diagram_group_group_width_height');
            diagram.add(newnode as Node);
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking node drag and changing the text element by double click', (done: Function) => {
            var diagramCanvas = document.getElementById(diagram.element.id + 'content');
            var offsetX = diagram.nodes[3].offsetX;
            var offsetY = diagram.nodes[3].offsetY;
            var mouseEvents = new MouseEvents();
            mouseEvents.mouseMoveEvent(diagramCanvas, offsetX, offsetY, true);
            mouseEvents.dragAndDropEvent(diagramCanvas, offsetX, offsetY, offsetX, offsetY);
            mouseEvents.mouseMoveEvent(diagramCanvas, 800, 100);
            mouseEvents.mouseLeaveEvent(diagramCanvas);
            mouseEvents.dragAndDropEvent(diagramCanvas, offsetX, offsetY, offsetX + 100, offsetY);
            var diagramCanvas = document.getElementById(diagram.element.id + 'content');
            mouseEvents.clickEvent(diagramCanvas, 400, 300);
            diagram.startTextEdit(diagram.selectedItems.nodes[0], diagram.selectedItems.nodes[0].annotations[0].id);
            (document.getElementById(diagram.element.id + '_editBox') as HTMLTextAreaElement).value = 'editText1';
            mouseEvents.clickEvent(diagramCanvas, 10, 10);
            var temp = document.getElementById(diagram.nodes[3].wrapper.children[1].id + '_groupElement');
            expect(temp.children[0].getAttribute('fill') === 'transparent').toBe(true);
            var shape = document.getElementById(diagram.nodes[3].wrapper.children[0].id + '_groupElement');
            expect(shape.children[0].getAttribute('d') === "M50,0 L100,100 L0,100 L50,0 Z ").toBe(true);
            let left: number; let top: number;
            mouseEvents.clickEvent(diagramCanvas, 1, 1);
            left = diagram.element.offsetLeft; top = diagram.element.offsetTop;
            let node: NodeModel = (diagram.nodes[3] as NodeModel);
            let annotation: DiagramElement = node.wrapper.children[1];
            mouseEvents.clickEvent(diagramCanvas, annotation.offsetX + left, annotation.offsetY + top);
            diagram.nudge('Right'); 
            done();
        });
        it('Checking source and target decorator color', (done: Function) => {
        let diagramCanvas = document.getElementById(diagram.element.id + 'content');
        let offsetX = diagram.connectors[0].wrapper.offsetX;
        let offsetY= diagram.connectors[0].wrapper.offsetY;

        mouseEvents.dragAndDropEvent(diagramCanvas, offsetX, offsetY, offsetX - 20, offsetY - 20);
        var connector = diagram.connectors[0];
        connector.targetDecorator.style.fill = 'red';
        diagram.dataBind();
        var element = document.getElementById((connector as Connector).id+'_tarDec_groupElement')
        expect(element.children[0].getAttribute('fill')==='red').toBe(true);
            done();
        });
        it('copy and paste group issue', (done: Function) => {
            let offsetX = diagram.nodes[2].offsetX;
        let offsetY = diagram.nodes[2].offsetY;
        let diagramCanvas = document.getElementById(diagram.element.id + 'content');
        var mouseEvents = new MouseEvents();
        mouseEvents.clickEvent(diagramCanvas, offsetX, offsetY);
        diagram.copy();
        diagram.paste();
        var node =diagram.nodes[5];
        var element = document.getElementById((node as Node).id+'_content_groupElement')
        expect(element.children[0].getAttribute('fill')==='white'&&element.children[0].getAttribute('stroke')==='black').toBe(true);
            done();
         });
        it('memory leak', () => {
            profile.sample();
            let average: any = inMB(profile.averageChange)
            //Check average change in memory samples to not be over 10MB
            expect(average).toBeLessThan(10);
            let memory: any = inMB(getMemoryProfile())
            //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
            expect(memory).toBeLessThan(profile.samples[0] + 0.25);
        })

    });
    describe('group undo redo', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_group_group_width_height' });
            document.body.appendChild(ele);
            var newnode = {
                offsetX: 250,
                offsetY: 250,
                width: 100,
                height: 100,
                shape: {
                    type: "Basic",
                    shape: "Triangle"
                },
                style: {
                    fill: '#6BA5D7',
                    strokeColor: 'white'
                },
                annotations: [
                    { content: "ssss",
                    constraints: AnnotationConstraints.Interaction,
                        style: { fill: "transparent" } }
                ]
            };
            var nodes = [
                {
                    id: 'node1', width: 50, height: 50, offsetX: 600,
                    offsetY: 300,
                }, {
                    id: 'node2', width: 50, height: 50, offsetX: 600,
                    offsetY: 400
                },
            ];

            diagram = new Diagram({
                width: '800px', height: '500px',nodes: nodes,
            });
            diagram.appendTo('#diagram_group_group_width_height');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('group the node and undo testing', (done: Function) => {
           let diagramCanvas = document.getElementById(diagram.element.id + 'content');
           diagram.selectAll();
           expect((diagram.selectedItems.nodes.length === 2)).toBe(true);
           diagram.group();
           diagram.undo();
           diagram.clearSelection();
           diagram.select([diagram.nameTable['node1']]);
           expect((diagram.selectedItems.nodes.length === 1)).toBe(true);
           done();
           diagram.select([diagram.nameTable['node2']]);
           expect((diagram.selectedItems.nodes.length === 1)).toBe(true);
           done();
        });
    });
    describe('Group - with selection issue', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_group_group_width_height' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node6', width: 50, height: 50, offsetX: 750,
                    offsetY: 100
                },
                {
                    id: 'node7', width: 50, height: 50, offsetX: 750,
                    offsetY: 170
                },
                {
                    id: 'node8', width: 50, height: 50, offsetX: 850,
                    offsetY: 100
                },

                { id: 'group4', children: ['node6', 'node7'], },
            ];

            diagram = new Diagram({
                width: '800px', height: '600px', nodes: nodes,
                scrollSettings: { verticalOffset: 20 },
                snapSettings: { constraints: 0 }, contextMenuSettings: { show: true }
            });
            diagram.appendTo('#diagram_group_group_width_height');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it('Checking group selection issue', (done: Function) => {
            diagram.nodes[3].rotateAngle = 45;
            diagram.dataBind();
            expect((Math.round(diagram.nodes[3].wrapper.bounds.left) == 690) &&
                (Math.round(diagram.nodes[3].wrapper.bounds.right) == 810)).toBe(true);
            done();
        });
    });

    describe('Group - Properties', () => {
        let diagram: Diagram;
        let ele: HTMLElement;
        let scroller: DiagramScroller;
        let mouseEvents: MouseEvents = new MouseEvents();

        beforeAll((): void => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                this.skip(); //Skips test (in Chai)
                return;
            }
            ele = createElement('div', { id: 'diagram_group_child_rendering' });
            document.body.appendChild(ele);
            let nodes: NodeModel[] = [
                {
                    id: 'node1', width: 50, height: 50, offsetX: 100,
                    offsetY: 100,
                }, {
                    id: 'node2', width: 50, height: 50, offsetX: 200,
                    offsetY: 200
                },
                { id: 'group', children: ['node1', 'node2'], rotateAngle: 45, offsetX: 300, offsetY: 300, style: {fill: 'orange', strokeColor: 'red' } },
            ];

            diagram = new Diagram({
                width: '800px', height: '600px', nodes: nodes,
            });
            diagram.appendTo('#diagram_group_child_rendering');
        });

        afterAll((): void => {
            diagram.destroy();
            ele.remove();
        });
        it("Checking group's childern not visiblie issue - When group have own properties", (done: Function) => {
            var group = document.getElementById(diagram.element.id + "_diagramLayer");
            expect(group.children.length == 1).toBe(true);
            done();
        });
    });

});