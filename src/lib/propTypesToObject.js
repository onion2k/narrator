const jsonata = require("jsonata");

const propTypesProperties = jsonata("properties");
const defaultPropsProperties = jsonata("properties");

function parsePropChain(proptype) {
  let prop = proptype.value || proptype;
  const chain = [];
  while (prop.hasOwnProperty('object') || prop.hasOwnProperty('callee')) {
    if (prop.hasOwnProperty('object')) {
      chain.push(prop.property.name);
      prop = prop.object;
    } else if (prop.hasOwnProperty('callee')) {
      const args = [];
      if (prop.hasOwnProperty('arguments')) {
        prop.arguments.forEach((arg) => {
          arg.elements.forEach((el) => {
            args.push(parsePropChain(el).reverse().join('.'));
          });
        });
      }
      chain.push(`${prop.callee.property.name}[${args.join(',')}]`);
      prop = prop.callee.object;
    }
  }
  if (prop.hasOwnProperty('name')) {
    chain.push(prop.name)
  }
  return chain;
}

const propTypesToObject = ({ pt, pd }) => {

  const propTypes = propTypesProperties.evaluate(pt);
  const defaultProps = defaultPropsProperties.evaluate(pd);

  let props = {};
  if (propTypes) {
    propTypes.forEach((prop) => {
      switch (prop.value.type) {
        case "MemberExpression":
          // console.log(prop.key.name, prop.value.type)
          break;
        case "CallExpression":
          // value callee
          // console.log(prop.key.name, prop.value.callee.type)
          break;
      }


      const chain = parsePropChain(prop);

      console.log(chain.reverse().join('.'))

      props[prop.key.name] = { type: prop.value.type, value: '', type: { string: chain.reverse().join('.'), array: chain.reverse() }, required: false };

    });
  }

  if (defaultProps) {
    defaultProps.forEach((prop) => {
      switch (prop.value.type) {
        case "ArrayExpression":
          props[prop.key.name].value = prop.value.elements.map(element => element.value);
          break;
        case "ObjectExpression":
          // This should recursively return object values based on types
          props[prop.key.name].value = prop.value.properties.reduce((i, element) => { i[element.key.name] = element.value.value;  return i;  }, {});
          break;
        case "StringLiteral":
        case "NumericLiteral":
          props[prop.key.name].value = prop.value.value;
          break;
      }
    });  
  }

  return props;

}

module.exports = {
  propTypesToObject
}
