const { SuperClass, CalleeName } = require('./Extractors');
const {
  find,
  findExpressionPropTypes,
  findClassPropTypes,
  declarationParamsToObject,
} = require('./AST');
const { propTypesToObject } = require('./propTypesToObject');

const parseNodeData = (node, narrator) => {
  let pt = {};
  const parsedJs = narrator.b;
  const identifierName = narrator.identifyNode(node);

  if (node) {
    const superClass = SuperClass.evaluate(node);
    switch (node.declaration.type) {
      case 'ClassDeclaration':
        pt = propTypesToObject(
          narrator.findPropTypes(node.declaration),
          parsedJs,
        );
        if (!Object.keys(pt).length) {
          if (identifierName) {
            pt = propTypesToObject(
              findExpressionPropTypes(parsedJs, identifierName),
              parsedJs,
            );
          }
        }
        return {
          name: identifierName,
          type: 'Class',
          super: `${superClass.object.name}.${superClass.property.name}`,
          pt,
        };

      case 'VariableDeclaration':
        narrator.findPropTypes(node.declaration);
        if (identifierName) {
          pt = propTypesToObject(
            findExpressionPropTypes(parsedJs, identifierName),
          );
        }
        return { name: identifierName, type: 'Variable', pt };

      case 'Identifier':
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
        return { name: identifierName, type: 'Identifier', pt };

      case 'CallExpression':
        if (CalleeName.evaluate(node) === 'connect') {
          const x = find(parsedJs, identifierName);
          if (x !== null) {
            if (x.type === 'ClassDeclaration') {
              pt = propTypesToObject(findClassPropTypes(x));
            } else if (x.type === 'VariableDeclaration') {
              pt = propTypesToObject(
                findExpressionPropTypes(parsedJs, identifierName),
              );
            }
          }
          return { name: identifierName, type: 'Call', pt };
        }
        break;

      case 'FunctionDeclaration':
        pt = declarationParamsToObject(node.declaration);
        return { name: identifierName, type: 'Function', pt };

      case 'Assignment':
        console.log('parseNodeData: Found Assignment');
        break;

      default:
        break;
    }
  }

  return true;
};

module.exports = { parseNodeData };
