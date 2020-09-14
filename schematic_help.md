# List nx schematics
nx list @nestjs/schematics

# Create nest app
# THIS DOESN'T SET IT UP VERY WELL, NEED EDGARS OPINION ON THIS
ng g @nestjs/schematics:application gisday-nest --directory apps/gisday-nest

# Get schematic usage information
ng g @nestjs/schematics:application --help



ng g @nestjs/schematics:service
ng g @nestjs/schematics:module test --source-root=libs/two/data-api/src/lib/modules --dry-run