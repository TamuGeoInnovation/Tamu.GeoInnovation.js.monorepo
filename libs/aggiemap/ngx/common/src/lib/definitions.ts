import { IComposedConnections } from './connections';

import { MainMapDefinitions, IComposedIDefinitions, IDefinition } from './definitions/main.definitions';

export { IDefinition, IComposedIDefinitions } from './definitions/main.definitions';

export function Definitions(Connections: IComposedConnections): IComposedIDefinitions {
  return MainMapDefinitions(Connections);
}
