import { Component, Input, OnInit } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-legend-element',
  templateUrl: './legend-element.component.html',
  styleUrls: ['./legend-element.component.scss']
})
export class LegendElementComponent implements OnInit {
  @Input()
  public element: ILegendElement;

  @Input()
  public layer: ILayer;

  @Input()
  public groupTitle: string;

  /**
   * Certain layers may have duplicate icon/label entries as a result of their unique value renderer definitions.
   *
   * This flag will de-duplicate the legend entries based on the layer title.
   */
  @Input()
  public deduplicateChildren = false;

  @Input()
  public respectDefinitionExpression = false;

  public infos:
    | any[]
    | esri.SymbolTableElementType[]
    | esri.ColorRampStop[]
    | esri.OpacityRampStop[]
    | esri.SizeRampStop[]
    | esri.HeatmapRampStop[];

  public ngOnInit(): void {
    if (this.deduplicateChildren) {
      this.infos = this.element.infos.filter((info, index, self) => {
        return index === self.findIndex((t) => t.label === info.label);
      });
    } else {
      this.infos = this.element.infos;
    }

    // Return early if we are not respecting definition expressions or there is no operable layer
    if (this.respectDefinitionExpression === false || this.layer === undefined) {
      return;
    }

    const operableLayer = this.layer as esri.FeatureLayer;

    // If operable layer has no definition expression, return early
    if (operableLayer.definitionExpression === null || operableLayer.definitionExpression === undefined) {
      return;
    }

    const renderer = operableLayer.renderer as esri.UniqueValueRenderer;

    // Ensure that the renderer is a unique value renderer
    if (renderer.type !== 'unique-value') {
      return;
    }

    // Ensure that the renderer has operable unique value infos
    if (
      renderer === null ||
      renderer === undefined ||
      renderer.uniqueValueInfos === null ||
      renderer.uniqueValueInfos === undefined ||
      renderer.uniqueValueInfos.length === 0
    ) {
      return;
    }

    // Determine how many fields are expected in the renderer value string.
    // This is necessary because the renderer value string can be a concatenation of multiple fields.
    const operableFields = [renderer.field, renderer.field2, renderer.field3].filter((f) => f !== null);

    // If there are no operable fields, return early
    if (operableFields.length === 0) {
      return;
    }

    // Unique value expressions can at most be a concatenation of 3 fields, with exact value matches. This means
    // that we can split the definition expression by the AND operator and check if any of the fields in the renderer
    // are part of the expression.
    //
    // We split the definition expression by the AND operator to get the individual expressions, if any.
    const expressions = operableLayer.definitionExpression.split('AND').map((exp) => exp.trim());

    // For every grouped expression, split it by the '=' comparison operator to get the field and value.
    const fieldValuePairs = expressions.map((exp) => {
      const [field, value] = exp.split('=').map((part) => part.trim());
      return { field, value: value.replace(/'/g, '') };
    });

    // Test if either expression includes any of the fields in the renderer value string.
    // If it does, we can filter the legend element infos to only include those that match the definition expression.
    const filteredInfos = this.infos.filter((info) => {
      // Deconstruct legend info.value so we can accurately compare it to the definition expression.
      const valueParts = operableFields.length ? info.value.split(renderer.fieldDelimiter) : [info.value];

      return fieldValuePairs.some((pair) => {
        return operableFields.some((field) => {
          const operableValue = valueParts[operableFields.indexOf(field)];

          return pair.field === field && pair.value === operableValue;
        });
      });
    });

    this.infos = filteredInfos;
  }
}

// Browser doesn't like direct esri types for inputs.
type ILegendElement = esri.LegendElement;
type ILayer = esri.Layer;
