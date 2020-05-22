import { apply, chain, externalSchematic, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { names } from '@nrwl/workspace';

interface UniversalAppSchema {
  name: string;
}

export default function(schema: UniversalAppSchema): Rule {
  return chain([
    externalSchematic('@nrwl/angular', 'application', {
      name: schema.name
    }),
    externalSchematic('@schematics/angular', 'universal', {
      clientProject: schema.name
    }),
    updateOutputPath(schema.name),
    externalSchematic('@nrwl/node', 'application', {
      name: `${schema.name}-ssr`,
      framework: 'none',
      directory: ''
    }),
    updateServerApp(schema.name),
    addConcatTarget(`${schema.name}-ssr`)
  ]);
}

function updateOutputPath(name: string): Rule {
  return (host: Tree) => {
    const angularJson = JSON.parse(host.read('angular.json').toString());
    const serverTargetFixed = angularJson.projects[name].architect.server;
    serverTargetFixed.options.outputPath = `dist/apps/${name}/server`;
    angularJson.projects[name].architect.server = serverTargetFixed;
    host.overwrite('angular.json', JSON.stringify(angularJson));
  };
}

function addConcatTarget(name: string): Rule {
  return (host: Tree) => {
    const serveAll = {
      builder: '@angular-devkit/architect:concat',
      options: {
        targets: [{ target: `${name}:build` }, { target: `${name}:server` }, { target: `${name}-ssr:serve` }]
      }
    };
    const angularJson = JSON.parse(host.read('angular.json').toString());
    angularJson.projects[`${name}-ssr`].architect['serve-all'] = serveAll;
    host.overwrite('angular.json', JSON.stringify(angularJson));
  };
}

function updateServerApp(name: string): Rule {
  return chain([
    (host: Tree) => {
      host.delete(`apps/${name}-ssr/src/main.ts`);
    },
    mergeWith(
      apply(url('./files'), [
        template({
          tmpl: '',
          ...names(name)
        }),
        move(`apps/${name}-ssr/src`)
      ])
    )
  ]);
}
