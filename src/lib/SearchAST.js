const jsonata = require("jsonata");

const { Expressions } = require("./Extractors");

const findClassByName = jsonata("program.body[type='ClassDeclaration'][**[name=$identifierName]]");
const findVariableByName =  jsonata("program.body[type='VariableDeclaration'][**[name=$identifierName]]");

const find = (b, identifierName) => {
  const c = findClassByName.evaluate(b, { identifierName });
  const v = findVariableByName.evaluate(b, { identifierName });
  return c || v || null;
}

const findExpressionPropTypes = (b, identifierName) => {
  let pt, pd;
  Expressions.evaluate(b).forEach((exp) => {
    if (exp.expression.left.object.name === identifierName) {
      if (exp.expression.left.property.name === 'propTypes') {
        pt = exp.expression.right;
      } else if (exp.expression.left.property.name === 'defaultProps') {
        pd = exp.expression.right;
      }
    }
  })
  return { pt, pd };
}

const findClassPropTypes = (x) => {
  const pt = jsonata("body.body[type='ClassProperty'][key.name='propTypes'].value").evaluate(x);
  const pd = jsonata("body.body[type='ClassProperty'][key.name='defaultProps'].value").evaluate(x);
  return { pt, pd };
}

module.exports = {
  find,
  findExpressionPropTypes,
  findClassPropTypes,
  findClassByName,
  findVariableByName,
}