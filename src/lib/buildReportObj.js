const { CalleeName } = require('./Extractors');
const {
  find,
  findExpressionPropTypes,
  findClassPropTypes,
  declarationParamsToObject,
} = require('./AST');
const { propTypesToObject } = require('./propTypesToObject');

const buildReportObj = (node, narrator) => {
  let pt = {};
  const parsedJs = narrator.b;
  const identifierName = narrator.identifyNode(node);

  if (node) {
    if (node.declaration.type === 'ClassDeclaration') {
      const x = node.declaration;

      pt = propTypesToObject(narrator.findPropTypes(x), parsedJs);

      if (!Object.keys(pt).length) {
        if (identifierName) {
          pt = propTypesToObject(
            findExpressionPropTypes(parsedJs, identifierName),
            parsedJs,
          );
        }
      }
      return { name: '', pt };
    }
    if (node.declaration.type === 'VariableDeclaration') {
      narrator.findPropTypes(node.declaration);
      if (identifierName) {
        pt = propTypesToObject(
          findExpressionPropTypes(parsedJs, identifierName),
        );
      }
      return { name: '', pt };
    }
    if (node.declaration.type === 'Identifier') {
      /**
       * Find the ident. If there isn't one, anon export?
       */
      try {
        const x = find(parsedJs, identifierName);
        if (!x) return { name: '', pt };
        if (x.type === 'ClassDeclaration') {
          // proptypes might be defined as external expression statements
          pt = propTypesToObject(findClassPropTypes(x), parsedJs);
          if (!Object.keys(pt).length) {
            if (identifierName) {
              pt = propTypesToObject(
                findExpressionPropTypes(parsedJs, identifierName),
                parsedJs,
              );
            }
          }
        } else if (x.type === 'VariableDeclaration') {
          if (identifierName) {
            pt = propTypesToObject(
              findExpressionPropTypes(parsedJs, identifierName),
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
      return { name: identifierName, pt };
    }
    if (node.declaration.type === 'CallExpression') {
      // const CallExpressionName = CalleeName.evaluate(node);
      if (CalleeName.evaluate(node) === 'connect') {
        // const identifierName = node.declaration.arguments[0].name;
        const x = find(parsedJs, identifierName);
        // def("Callee arg 0", x, identifierName);
        if (x !== null) {
          if (x.type === 'ClassDeclaration') {
            pt = propTypesToObject(findClassPropTypes(x));
          } else if (x.type === 'VariableDeclaration') {
            pt = propTypesToObject(
              findExpressionPropTypes(parsedJs, identifierName),
            );
          }
        }
        return { name: identifierName, pt };
      }
    } else if (node.declaration.type === 'FunctionDeclaration') {
      pt = declarationParamsToObject(node.declaration);
      return { name: identifierName, pt };
    } else {
      // console.log("Export Default".padEnd(15),
      //   "(Something Else)",
      //   exportDefault.declaration.type);
    }
  }

  return true;
};

module.exports = { buildReportObj };
