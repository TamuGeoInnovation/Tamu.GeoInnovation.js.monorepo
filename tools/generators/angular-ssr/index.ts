import { apply, chain, externalSchematic, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { names } from '@nrwl/workspace';

// Debug schematic
// node --inspect-brk .\node_modules\@nrwl\cli\bin\nx.js workspace-schematic angular-ssr --dry-run

interface UniversalAppSchema {
  angularAppName: string;
  expressAppName: string;
}

export default function (schema: UniversalAppSchema): Rule {
  return chain([
    externalSchematic('@nrwl/angular', 'application', {
      name: schema.angularAppName
    }),
    externalSchematic('@schematics/angular', 'universal', {
      clientProject: schema.angularAppName
    }),
    updateOutputPath(schema.angularAppName),
    externalSchematic('@nrwl/node', 'application', {
      name: `${getExpressAppName(schema)}`,
      framework: 'none',
      directory: ''
    }),
    updateServerApp(schema.angularAppName, getExpressAppName(schema)),
    addConcatTarget(schema.angularAppName, getExpressAppName(schema))
  ]);
}

function getExpressAppName(schema: UniversalAppSchema) {
  return `${schema.expressAppName.length > 0 ? schema.expressAppName : schema.angularAppName + '-ssr'}`;
}

function updateOutputPath(name: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(host.read('workspace.json').toString());

    const serverTargetFixed = angularJson.projects[name].architect.server;
    const buildTargetFixed = angularJson.projects[name].architect.build;

    serverTargetFixed.options.outputPath = `dist/apps/${name}/server`;
    buildTargetFixed.options.outputPath = `dist/apps/${name}/browser`;

    angularJson.projects[name].architect.server = serverTargetFixed;
    angularJson.projects[name].architect.build = buildTargetFixed;

    host.overwrite('workspace.json', JSON.stringify(angularJson, null, '  '));
  };
}

function addConcatTarget(angularName: string, expressName: string): Rule {
  return (host: Tree) => {
    const serveAll = {
      builder: '@angular-devkit/architect:concat',
      options: {
        targets: [
          { target: `${angularName}:build` },
          { target: `${angularName}:server` },
          { target: `${expressName}:serve` }
        ]
      }
    };

    const angularJson = JSON.parse(host.read('workspace.json').toString());
    angularJson.projects[`${expressName}`].architect['serve-all'] = serveAll;
    host.overwrite('workspace.json', JSON.stringify(angularJson, null, '  '));
  };
}

function updateServerApp(angularName: string, expressName: string): Rule {
  return chain([
    (host: Tree) => {
      host.delete(`apps/${expressName}/src/main.ts`);
    },
    mergeWith(
      apply(url('./files'), [
        template({
          tmpl: '',
          ...names(angularName)
        }),
        move(`apps/${expressName}/src`)
      ])
    )
  ]);
}
