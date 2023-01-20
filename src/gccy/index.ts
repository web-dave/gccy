import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from "@angular-devkit/schematics";
import { Schema } from "./schema";
import { parseName } from "@schematics/angular/utility/parse-name";

const cyFile = (component: string) => `
describe('${component}Component', () => {
  it('create ${component}Component', () => {
    cy.mount(${component}Component, {
      autoSpyOutputs: true
    });
  });
});
`;

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function gccy(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    console.log("Running schematics with following options", _options);
    const workspaceAsBuffer = tree.read("angular.json");

    if (!workspaceAsBuffer) {
      throw new SchematicsException(
        "We are not inside of Angular CLI workspace"
      );
    }

    const componentPath = _options.path.split("/");
    const name = componentPath[componentPath.length - 1];
    const componentName = name
      .split("-")
      .map((str) => str.toLowerCase())
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join("");

    console.log(componentName);

    const p = _options.path.replace("/" + name, "");

    console.log(parseName(p, componentName));

    const workspace = JSON.parse(workspaceAsBuffer.toString());
    const projects = Object.keys(workspace.projects);
    const projectName = _options.project || projects[0];

    const project = workspace.projects[projectName];

    const sourceRoot = project.sourceRoot;

    const projectType = project.projectType;

    const type = projectType === "application" ? "app" : "lib";

    const path = `${sourceRoot}/${type}`;

    console.log(`${path}/${_options.path}.cy.ts`);

    tree.create(`${path}/${_options.path}.cy.ts`, cyFile(componentName));

    return tree;
  };
}
