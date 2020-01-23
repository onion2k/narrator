const jsonata = require("jsonata");

const findImportByName = jsonata("program.body[type='ImportDeclaration'][**[name=$identifierName]]");
const findFunctionByName = jsonata("program.body[type='FunctionDeclaration'][**[name=$identifierName]]");
const findClassByName = jsonata("program.body[type='ClassDeclaration'][**[name=$identifierName]]");
const findVariableByName =  jsonata("program.body[type='VariableDeclaration'][**[name=$identifierName]]");
const findClassProperty = jsonata("body.body[type='ClassProperty'][key.name=$classProperty].value");
const findExpressionsByLeftIdentifierName = jsonata("program.body[type='ExpressionStatement'].expression[**[name=$identifierName]]");

const { declarationParamsToObject } = require('./AST')

const find = (b, identifierName) => {
  const i = findImportByName.evaluate(b, { identifierName });
  const f = findFunctionByName.evaluate(b, { identifierName });
  const c = findClassByName.evaluate(b, { identifierName });
  const v = findVariableByName.evaluate(b, { identifierName });
  return i || f || c || v || null;
}

const findExpressionPropTypes = (b, identifierName) => {
  let pt = {};
  let pd = {};

  if (!identifierName) { console.log('Missing ID'); return { pt, pd }; }

  if (findExpressionsByLeftIdentifierName.evaluate(b, { identifierName })) {
    const expressions = findExpressionsByLeftIdentifierName.evaluate(b, { identifierName });
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
      } else if (expressions.left.property.name === 'defaultProps') {
        pd = { properties: expressions.right };
      }
    }
  
  } else {
    // component defined as assignment and then exported separately
    const v = findVariableByName.evaluate(b, { identifierName });
    v.declarations.forEach((variable) => {
      pt = declarationParamsToObject(variable.init)
    });
    // console.log(identifierName, v.declarations[0].init.params[0].properties[0].key.name)
  }
  return { pt: pt ? pt.properties : {}, pd: pd ? pd.properties : {} };
}

const findClassPropTypes = (x) => {
  const pt = findClassProperty.evaluate(x, { classProperty: 'propTypes' });
  const pd = findClassProperty.evaluate(x, { classProperty: 'defaultProps' });
  return { pt, pd };
}

module.exports = {
  find,
  findExpressionPropTypes,
  findClassPropTypes,
  findClassByName,
  findVariableByName,
}