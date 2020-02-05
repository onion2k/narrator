const fs = require('fs');
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
    delete nodeCopy.trailingComments;

    Object.entries(nodeCopy).forEach(([key, value]) => {
      const val = value !== null ? value.type : '';
      console.log(''.padStart(indent), key, val);
      if (key !== 'superClass') {
        switch (val) {
          case 'ClassProperty':
            break;
          case 'ClassMethod':
            break;
          case 'JSXElement':
            break;
          case 'ObjectProperty':
            break;
          default:
            traverse(value, indent + 1);
            break;
        }
      }
    });
  } else {
    // jsonObj is a number or string
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
