import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { v4 as guid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class DragService {
  /**
   * Service UIDragStates store. Interfaced internally.
   */
  private _states: BehaviorSubject<Array<UIDragState>> = new BehaviorSubject([]);

  /**
   * Exposed observable containing the latest service store value that components can use to determine
   * and dispatch events based on child component drag states.
   */
  public states: Observable<Array<UIDragState>> = this._states.asObservable();

  /**
   * Registers the class component with the ui drag service
   *
   * If a component class instance is provided, the component name will be used as the identifier.
   *
   * Else, a random GUID will be generated and be used as the identifier.
   */
  public register(classInstance?: object): string {
    const state = new UIDragState({
      guid: classInstance ? classInstance.constructor.name : guid()
    });

    // Store the new component registration
    this.state = state;

    // Return the identifier stored and used by invoking components
    return state.guid;
  }

  /**
   * Removes an identifier from the ui drag service.
   *
   * Prevents from remnants from inactive components from being left behind that would influence
   * results of any truthy/falsy statements.
   */
  public unregister(identifier: string): void {
    this._states.next(this._states.value.filter((state) => state.guid !== identifier));
  }

  /**
   * Either adds a new state or updates an existing drag state based on provided guid.
   */
  public set state(state: UIDragState) {
    const allButProvided = this._states.value.filter((stateItem) => {
      return stateItem.guid !== state.guid;
    });

    this._states.next([...allButProvided, ...[state]]);
  }
}

export interface UIDragStateProperties {
  /**
   * Unique component identifier, either class name extracted from reference or a random guid.
   *
   * Used to reference UIDragStates when there are many draggable components in a single view.
   */
  guid: string;

  /**
   * Relative drag percentage of a draggable component.
   *
   * 0% is the initial top-most edge of a component.
   *
   * 100% is the top of the viewport.
   *
   * For any component, <100% or >100% is possible depending on component inner height.
   */
  dragPercentage?: number;

  /**
   * String representation for current drag state.
   */
  dragState?: 'static' | 'drag-start' | 'drag-move' | 'drag-end';
}

/**
 * Represents draggable drag state for a single component, referenced by the guid property.
 */
export class UIDragState {
  public guid: UIDragStateProperties['guid'];
  public dragPercentage: UIDragStateProperties['dragPercentage'];
  public dragState: UIDragStateProperties['dragState'];

  /**
   * Represents draggable drag state for a single component, referenced by the guid property.
   *
   * Creates an instance of UIDragState.
   */
  constructor(props: UIDragStateProperties) {
    this.guid = props.guid;
    this.dragPercentage = props.dragPercentage || 0;
    this.dragState = props.dragState || 'static';
  }
}
