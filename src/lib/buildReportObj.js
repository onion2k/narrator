const { IdentifierName, CalleeName } = require('./Extractors');
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
  if (node) {
    if (node.declaration.type === 'ClassDeclaration') {
      const x = node.declaration;

      pt = propTypesToObject(narrator.findPropTypes(x), parsedJs);
      console.log('pt', pt);
      if (!Object.keys(pt).length) {
        // const identifierName = IdentifierName.evaluate(node);
        // if (identifierName) {
        //   pt = propTypesToObject(findExpressionPropTypes(parsedJs, identifierName), parsedJs);
        // }
      }
      return { name: '', pt };
    } if (node.declaration.type === 'VariableDeclaration') {
      const identifierName = IdentifierName.evaluate(node);
      if (identifierName) {
        pt = propTypesToObject(
          findExpressionPropTypes(parsedJs, identifierName),
        );
      }
      return { name: '', pt };
    } if (node.declaration.type === 'Identifier') {
      /**
       * Find the ident. If there isn't one, anon export?
       */
      const identifierName = IdentifierName.evaluate(node);
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
    } if (node.declaration.type === 'CallExpression') {
      // const CallExpressionName = CalleeName.evaluate(node);
      if (CalleeName.evaluate(node) === 'connect') {
        const identifierName = node.declaration.arguments[0].name;
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
      const identifierName = node.declaration.id
        ? node.declaration.id.name
        : 'Anon';
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
