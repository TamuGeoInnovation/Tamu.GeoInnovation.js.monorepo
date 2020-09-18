# List of schematics
nx list

# List @nestjs schematics
nx list @nestjs/schematics

# Provide list of availble commands for this schematic:scope
ng g @nestjs/schematics:application --help

# Create nest app
ng g @nrwl/nest:application {applicationName} <- this good

# Generate a nest library / guard / controller / module / whatever
ng g @nestjs/schematics:library --source-root libs/{path}/{to}/{lib}

# Generate Angular app
ng g app // "configure routing for this application" does not matter yes or no

# Generate an Angular library
ng g lib {path/to/library} // turns slashes into dash concatenated

# Create Angular module / component / service / whatever for a library
ng g module modules/profile/details --project {libraryName}

For applications:
	- It's best to have a scope or you'll start overwritting shit
	- projectname-optionalscope-stack/framework
	- ex gisday-nest // no scope
	- ex two-valup-nest // with scope
For libraries:
	- projectname-scope
	- ex gisday-ngx
	- ex gisday-data-api
	- ex two-valup
	