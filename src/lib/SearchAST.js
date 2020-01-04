const jsonata = require("jsonata");

const { Expressions } = require("./Extractors");

const findClassByName = jsonata("program.body[type='ClassDeclaration'][**[name=$identifierName]]");
const findVariableByName =  jsonata("program.body[type='VariableDeclaration'][**[name=$identifierName]]");
const findClassProperty = jsonata("body.body[type='ClassProperty'][key.name=$classProperty].value");

const find = (b, identifierName) => {
  const c = findClassByName.evaluate(b, { identifierName });
  const v = findVariableByName.evaluate(b, { identifierName });
  return c || v || null;
}

const findExpressionPropTypes = (b, identifierName) => {
  let pt = {};
  let pd = {};
  if (Expressions.evaluate(b)) {
    Expressions.evaluate(b).forEach((exp) => {

      // expand expressions there return propTypes and defaults?
      
      if (exp.expression.left.object.name === identifierName) {
        if (exp.expression.left.property.name === 'propTypes') {
          pt = exp.expression.right;
        } else if (exp.expression.left.property.name === 'defaultProps') {
          pd = exp.expression.right;
        }
      }
    });  
  }
  return { pt, pd };
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