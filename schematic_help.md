# List nx schematics
nx list @nestjs/schematics

# Create nest app
# THIS DOESN'T SET IT UP VERY WELL, NEED EDGARS OPINION ON THIS
ng g @nestjs/schematics:application gisday-nest --directory apps/gisday-nest

# Get schematic usage information
ng g @nestjs/schematics:application --help

# Generate a lib
ng g @nrwl/web:library projectlib/sublib

# Create lib for an app
ng g module modules/profile/details --project oidc-admin --dry-run

# Add module to a nest-lib
ng g @nestjs/schematics:module test --source-root=libs/two/data-api/src/lib/modules --dry-run


ng g @nestjs/schematics:service
