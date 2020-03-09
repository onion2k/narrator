const fs = require('fs');
const { get } = require('lodash');
const babelParser = require('@babel/parser');
const config = require('../narrator.config.json');
const { Exports } = require('./Extractors');
const { Imports, ImportLibTest } = require('./Imports');
// const { buildReportObj } = require('./buildReportObj');
const { findClassPropTypes } = require('./AST');

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
      const val = value !== null ? value.type || typeof value : 'null';
      if (key !== 'superClass') {
        switch (val) {
          case 'ReturnStatement':
            console.log(get(value, 'argument.type'));
            break;
          default:
            traverse(value, indent + 1);
            break;
        }
      } else {
        if (value === null) return;
        console.log(
          get(value, 'object.name'),
          '.',
          get(value, 'property.name'),
        );
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
      CallExpression: 'declaration.arguments.0.name',
      Identifier: 'declaration.name',
    },
  };

  mapNodes = () => {
    delete this.b.start;
    delete this.b.end;
    delete this.b.loc;

    delete this.b.program.start;
    delete this.b.program.end;
    delete this.b.program.loc;
    delete this.b.program.interpreter;

    delete this.b.comments;

    traverse(this.b);

    return {};
  };

  identifyNode = (node) => {
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

  resolveIdentifier = () => {
    /**
     * Take an identifier and return the node it identifies
     */
  };
}

module.exports = { Narrator };
