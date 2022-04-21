import { Component, Input, OnInit } from '@angular/core';

import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import { BaseDrawComponent, ISketchViewModelEvent } from '../base/base.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map-draw-advanced',
  templateUrl: './map-draw-advanced.component.html',
  styleUrls: ['./map-draw-advanced.component.scss']
})
export class MapDrawAdvancedComponent extends BaseDrawComponent implements OnInit {
  /**
   * Defines whether or not the color tools will be visible.
   */
  @Input()
  public colorTools = false;

  /**
   * Defines whether or not the drawing help tools will be visible.
   */
  @Input()
  public helpTools = false;

  /**
   * Represents a list of pre-defined colors.
   */
  @Input()
  public colorPresets: Array<string> = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B',
    '#FFFFFF'
  ];

  /**
   * Default and actively selected color
   */
  public selectedColor = '#757575';

  /**
   * Color class container necessary for color format conversion (hex to rgb, for example).
   */
  private _color: esri.ColorConstructor;

  public ngOnInit(): void {
    super.ngOnInit();

    this.moduleProvider.require(['Color']).then(([color]: [esri.ColorConstructor]) => {
      this._color = color;
    });
  }

  public setColor(c: string) {
    const color = this.getColor(c);

    this.selectedColor = c;

    this.model.polylineSymbol.color = color.fill;

    this.model.pointSymbol.color = color.fill;

    this.model.polygonSymbol.color = color.fill;
    (this.model.polygonSymbol as ISimpleFillSymbol).outline.color = color.border;

    // Since the model default graphic symbols only apply to newly created graphics IN a given editing/creating session,
    // the color will not update for existing graphics that were added to the draw layer. Going through the graphics and
    // manually updating the symbols is necessary.
    if (this.model.activeTool === 'transform' || this.model.activeTool === 'reshape') {
      // Find the layers in the model graphics layer and filter out the ones currently selected.
      const graphics = this.model.layer.graphics.filter((layerGraphic) => {
        return (
          this.model.updateGraphics.findIndex(
            (updateGraphic) => (updateGraphic as unknown as IGraphic).uid === (layerGraphic as unknown as IGraphic).uid
          ) > -1
        );
      });

      // For all the selected layers, wait until the update event is complete and then apple the symbol styles,
      // otherwise it will apply to the update symbol state.
      const e = this.model.on('update', (event) => {
        // Assert string on second event.state because the typings do not have "cancel" as a valid event.
        if (event.state === 'complete' || (event.state as string) === 'cancel') {
          this.setGraphicsSymbol(graphics, color);

          // Clean up our events
          e.remove();

          // Event though a simple color change on the sketch view model results in an update cancel event state
          // that does not emit a completed state that ultimately emits the drawn feature, we need to force emit
          // otherwise the changes will not propagate up to the consuming component.
          this.onUpdate();
        }
      });
    }
  }

  private getColor(color: string): IGeneratedColor {
    const fill = new this._color(color);
    const border = new this._color(color);
    fill.a = 0.4;
    border.a = 0.8;

    return { fill, border };
  }

  private setGraphicSymbol(graphic: esri.Graphic, color: IGeneratedColor) {
    if (graphic.geometry.type === 'polygon') {
      graphic.symbol.color = color.fill;
      (graphic.symbol as ISimpleFillSymbol).outline.color = color.border;
    } else if (graphic.geometry.type === 'polyline') {
      graphic.symbol.color = color.fill;
    } else if (graphic.geometry.type === 'point') {
      graphic.symbol.color = color.fill;
    }
  }

  private setGraphicsSymbol(graphics: esri.Collection<esri.Graphic>, color: IGeneratedColor) {
    graphics.forEach((graphic) => {
      this.setGraphicSymbol(graphic, color);
    });
  }

  public override onCreate(event: Partial<ISketchViewModelEvent & esri.SketchViewModelCreateEvent>) {
    if (event.graphic) {
      const g = this.model.layer.graphics.find(
        (g) => (g as unknown as IGraphic).uid === (event.graphic as unknown as IGraphic).uid
      );

      const jsonedSymbol = g.symbol.toJSON();
      const unjsonedSymbol = (g.symbol.constructor as unknown as SymbolConstructor).fromJSON(jsonedSymbol);

      g.symbol = unjsonedSymbol;

      this.setGraphicSymbol(g, this.getColor(this.selectedColor));
    }

    this.emitDrawn(this.model.layer.graphics);
  }
}

/**
 * Necessary polyfill interface because the current version typings do not have an outline
 * definition on a SimpleFillSymbol.
 */
interface ISimpleFillSymbol extends esri.SimpleFillSymbol {
  outline: esri.SimpleLineSymbol;
}

interface IGeneratedColor {
  fill: esri.Color;
  border: esri.Color;
}

interface SymbolConstructor {
  fromJSON: (json) => esri.Symbol;
}
