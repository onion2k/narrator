const jsonata = require('jsonata');

const findImportByName = jsonata(
  "program.body[type='ImportDeclaration'][**[name=$identifierName]]",
);
const findFunctionByName = jsonata(
  "program.body[type='FunctionDeclaration'][**[name=$identifierName]]",
);
const findClassByName = jsonata(
  "program.body[type='ClassDeclaration'][**[name=$identifierName]]",
);
const findVariableByName = jsonata(
  "program.body[type='VariableDeclaration'][**[name=$identifierName]]",
);
const findClassProperty = jsonata(
  "body.body[type='ClassProperty'][key.name=$classProperty].value",
);
const findExpressionsByLeftIdentifierName = jsonata(
  "program.body[type='ExpressionStatement'].expression[**[name=$identifierName]]",
);

const find = (b, identifierName) => {
  const i = findImportByName.evaluate(b, { identifierName });
  const f = findFunctionByName.evaluate(b, { identifierName });
  const c = findClassByName.evaluate(b, { identifierName });
  const v = findVariableByName.evaluate(b, { identifierName });
  return i || f || c || v || null;
};

const declarationParamsToObject = (declaration) => {
  if (declaration.params) {
    const pt = {};
    let objCount = 0;
    // need to evaluate what each param actually is ...
    declaration.params.forEach((param) => {
      if (param.type === 'ObjectPattern') {
        // destructured object
        objCount += 1;
        pt[`obj${objCount}`] = {
          type: { string: 'Object' },
          value: {},
          required: false,
        };
        param.properties.forEach((element) => {
          /** Loop through obj properties */
          switch (element.value.type) {
            case 'Identifier':
              /** Identifier doesn't have a default assignment, so it's a required prop */
              pt[`obj${objCount}`].value[element.key.name] = {
                type: { string: 'PropTypes.any' },
                value: '',
                required: true,
              };
              break;
            case 'AssignmentPattern':
              /** Assignment does have a default assignment, so it's not a required prop */
              pt[`obj${objCount}`].value[element.key.name] = {
                type: { string: element.value.right.type },
                value: element.value.right.value || 'Function',
                required: false,
              };
              break;
            default:
              break;
          }
        });
      } else if (param.type === 'AssignmentPattern') {
        // expand using the same recusrive function as propttypes based on types
        pt[param.left.name] = {
          type: { string: param.right.type },
          value: param.right.value,
          required: false,
        };
      } else if (param.type === 'Identifier') {
        pt[param.name] = {
          type: { string: 'PropTypes.any' },
          value: '',
          required: false,
        };
      }
    });

    return pt;
  }

  return {};
};

const findExpressionPropTypes = (b, identifierName) => {
  let pt = {};
  let pd = {};

  if (!identifierName) {
    // Not gonna work with anonymous functions if we do this...
    console.log('Missing ID: ', identifierName);
    return { pt, pd };
  }

  if (findExpressionsByLeftIdentifierName.evaluate(b, { identifierName })) {
    const expressions = findExpressionsByLeftIdentifierName.evaluate(b, {
      identifierName,
    });
    if (Symbol.iterator in Object(expressions)) {
      expressions.forEach((exp) => {
        // expand expressions there return propTypes and defaults?
        if (exp.left.property.name === 'propTypes') {
          pt = { properties: exp.right };
        } else if (exp.left.property.name === 'defaultProps') {
          pd = { properties: exp.right };
        }
      });
    } else {
      // only one expression was found
      if (expressions.left.property.name === 'propTypes') {
        pt = { properties: expressions.right };
      }
      if (expressions.left.property.name === 'defaultProps') {
        pd = { properties: expressions.right };
      }
    }
  } else {
    // component defined as assignment and then exported separately
    const v = findVariableByName.evaluate(b, { identifierName });
    if (v) {
      v.declarations.forEach((variable) => {
        pt = declarationParamsToObject(variable.init);
      });
    }
  }
  return { pt: pt ? pt.properties : {}, pd: pd ? pd.properties : {} };
};

const findClassPropTypes = (x) => {
  const pt = findClassProperty.evaluate(x, { classProperty: 'propTypes' });
  const pd = findClassProperty.evaluate(x, { classProperty: 'defaultProps' });
  return { pt, pd };
};

module.exports = {
  find,
  findExpressionPropTypes,
  findClassPropTypes,
  findClassByName,
  findVariableByName,
  declarationParamsToObject,
};
