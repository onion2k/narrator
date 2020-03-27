const fs = require('fs');
const { get } = require('lodash');
const babelParser = require('@babel/parser');
const config = require('../narrator.config.json');
const { Exports } = require('./Extractors');
const { Imports, ImportLibTest } = require('./Imports');
// const { buildReportObj } = require('./buildReportObj');
const {
  findClassPropTypes,
  findFunctionByName,
  findClassByName,
} = require('./AST');

function traverse(node, indent = 0) {
  if (node !== null && typeof node === 'object') {
    const nodeCopy = { ...node };
    delete nodeCopy.start;
    delete nodeCopy.end;
    delete nodeCopy.loc;

    delete nodeCopy.computed;
    delete nodeCopy.shorthand;
    delete nodeCopy.extra;
    delete nodeCopy.leadingComments;
    delete nodeCopy.trailingComments;

    Object.entries(nodeCopy).forEach(([key, value]) => {
      switch (key) {
        case 'superClass':
          if (value === null) return;
          console.log(
            `${get(value, 'object.name')}.${get(value, 'property.name')}`,
          );
          break;
        case 'key':
          console.log('Method', indent, get(value, 'type'), get(value, 'name'));
          break;
        default:
          if (get(value, 'type') === 'ReturnStatement') {
            console.log(
              '---',
              indent,
              get(value, 'type'),
              get(value, 'argument.type'),
            );
          }
          traverse(value, indent + 1);
          break;
      }
    });
  }
}

class Narrator {
  constructor(file) {
    const contents = fs.readFileSync(file, 'utf8');

    const b = babelParser.parse(contents, {
      sourceType: 'module',
      plugins: config.babel.plugins,
    });

    this.file = file;
    this.b = b;
  }

  /**
   * Mapping nodes in js react comps
   */
  typeMap = {
    ExportNamedDeclaration: {
      AssignmentExpression: 'declaration.left.name',
      VariableDeclaration: 'declaration.declarations.0.id.name', // index here is wrong
      FunctionDeclaration: 'declaration.id.name',
      ClassDeclaration: 'declaration.id.name',
      Identifier: {},
    },
    ExportDefaultDeclaration: {
      AssignmentExpression: 'declaration.left.name',
      FunctionDeclaration: 'declaration.id.name',
      ClassDeclaration: 'declaration.id.name',
      CallExpression: 'declaration.arguments.0.name', // index here is wrong
      Identifier: 'declaration.name',
    },
  };

  mapNodes = () => {
    traverse(this.b);
    return {};
  };

  identifyNode = (node) => {
    // This assumes the node is a callExpression rather than an identifier
    if (
      Object.prototype.hasOwnProperty.call(node, 'declaration')
      && node.declaration !== null
    ) {
      return get(
        node,
        `${this.typeMap[node.type][node.declaration.type]}`,
        'anon',
      );
    }

    if (Object.prototype.hasOwnProperty.call(node, 'specifiers')) {
      return get(node, 'specifiers.0.exported.name'); // index is wrong here, need to use a forEach
    }

    return null;
  };
  /**
   * ends
   */

  findPropTypes = (declaration) => {
    switch (declaration.type) {
      case 'ClassDeclaration':
        return findClassPropTypes(declaration);
      default:
        console.log(`${declaration.type} type not found in findPropTypes`);
        return false;
    }
  };

  listExports = () => Exports.evaluate(this.b);

  listImports = () => {
    const imports = Imports.evaluate(this.b);
    if (!imports) {
      return [];
    }
    if (!imports.sequence) {
      return [imports];
    }
    delete imports.sequence;
    return imports;
  };

  checkImports = (imports) => Object.fromEntries(
    imports.map((i) => [i, !!ImportLibTest(i).evaluate(this.b)]),
  );

  resolveIdentifier = (identifierName) => {
    const f = findFunctionByName.evaluate(this.b, { identifierName });
    const c = findClassByName.evaluate(this.b, { identifierName });
    return f || c || null;
  };
}

module.exports = { Narrator };
