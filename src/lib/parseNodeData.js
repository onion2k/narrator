const {
  SuperClass,
  CalleeName,
  ClassMethod,
  ClassMethodReturnStatement,
} = require('./Extractors');

const {
  find,
  findExpressionPropTypes,
  findClassPropTypes,
  declarationParamsToObject,
} = require('./AST');
const { propTypesToObject } = require('./propTypesToObject');

const parseNodeData = (node, narrator, identifierName) => {
  let pt = {};
  const parsedJs = narrator.b;

  if (node) {
    const superClass = SuperClass.evaluate(node);
    switch (node.type) {
      case 'ClassDeclaration':
        pt = propTypesToObject(narrator.findPropTypes(node), parsedJs);
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
          super:
            superClass && superClass.object !== undefined
              ? `${superClass.object.name}.${superClass.property.name}`
              : 'null',
          pt,
        };

      case 'VariableDeclaration':
        narrator.findPropTypes(node);
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
        pt = declarationParamsToObject(node);
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

const parseClassData = (exp) => {
  /**
   * Find the class methods if there are any, and find out what they return
   */
  const properties = [];
  const methods = [];

  let classMethods = ClassMethod.evaluate(exp);
  if (classMethods) {
    if (typeof classMethods[Symbol.iterator] !== 'function') {
      classMethods = [classMethods];
    }
    classMethods.forEach((method) => {
      const returns = ClassMethodReturnStatement.evaluate(method);
      if (returns) {
        methods.push({
          method: method.key ? method.key.name : method.key,
          returns: returns[0] ? returns[0].argument.type : '',
        });
      } else {
        properties.push(method.key.name);
      }
    });
  }

  return { properties, methods };
};

module.exports = { parseNodeData, parseClassData };
