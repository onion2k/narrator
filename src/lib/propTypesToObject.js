const jsonata = require('jsonata');
const { find } = require('../lib/AST.js');

const propTypesProperties = jsonata('properties');
const defaultPropsProperties = jsonata('properties');

function parsePropChain(proptype) {
  let prop = proptype.value || proptype;
  const chain = [];
  try {
    if (typeof prop === 'object' && prop !== null) {
      while (
        Object.prototype.hasOwnProperty.call(prop, 'object')
        || Object.prototype.hasOwnProperty.call(prop, 'callee')
      ) {
        if (Object.prototype.hasOwnProperty.call(prop, 'object')) {
          chain.push(prop.property.name);
          prop = prop.object;
        } else if (Object.prototype.hasOwnProperty.call(prop, 'callee')) {
          const args = [];
          if (Object.prototype.hasOwnProperty.call(prop, 'arguments')) {
            prop.arguments.forEach((arg) => {
              if (Object.prototype.hasOwnProperty.call(arg, 'elements')) {
                arg.elements.forEach((el) => {
                  args.push(
                    parsePropChain(el)
                      .reverse()
                      .join('.'),
                  );
                });
              }
            });
          }
          if (Object.prototype.hasOwnProperty.call(prop.callee, 'property')) {
            chain.push(`${prop.callee.property.name}[${args.join(',')}]`);
          } else {
            chain.push(`${prop.callee.name}[${args.join(',')}]`);
          }
          if (Object.prototype.hasOwnProperty.call(prop.callee, 'object')) {
            prop = prop.callee.object;
          } else {
            prop = false;
          }
        }
      }
      chain.push(prop.name);
    }
  } catch (e) {
    console.error('Failed to parse prop chain.', proptype);
    process.exit(1);
  }
  return chain;
}

const propTypesToObject = ({ pt, pd }, b) => {
  const propTypes = propTypesProperties.evaluate(pt);
  const defaultProps = defaultPropsProperties.evaluate(pd);

  const props = {};
  if (propTypes) {
    propTypes.forEach((prop) => {
      const chain = parsePropChain(prop);
      const required = chain[0] === 'isRequired';
      chain.reverse();
      props[prop.key.name] = {
        value: '',
        type: { string: chain.join('.'), chain },
        required,
      };
    });
  }

  if (defaultProps) {
    defaultProps.forEach((prop) => {
      const x = find(b, prop.key.name);
      switch (prop.value.type) {
        case 'ArrayExpression':
          props[prop.key.name].value = prop.value.elements.map(
            (element) => element.value,
          );
          break;
        case 'ObjectExpression':
          props[prop.key.name].value = prop.value.properties.reduce(
            (i, element) => {
              const copy = { ...i };
              copy[element.key.name] = element.value.value;
              return copy;
            },
            {},
          );
          break;
        case 'NullLiteral':
          if (props[prop.key.name].type.string === 'PropTypes.node') {
            props[prop.key.name].value = 'Component';
          } else {
            props[prop.key.name].value = 'null';
          }
          break;
        case 'MemberExpression':
          props[
            prop.key.name
          ].value = `${prop.value.object.name}.${prop.value.property.name}`;
          break;
        case 'Identifier':
          if (typeof x === 'object' && x !== null) {
            switch (x.type) {
              case 'ImportDeclaration':
                props[
                  prop.key.name
                ].value = `${prop.value.name} from ${x.source.value}`;
                break;
              case 'FunctionDeclaration':
                props[
                  prop.key.name
                ].value = `${prop.value.name} from line ${x.id.start}`;
                break;
              default:
                break;
            }
          } else if (x === null) {
            props[prop.key.name].value = 'NULL';
          } else {
            props[prop.key.name].value = x;
          }
          break;
        case 'StringLiteral':
          props[prop.key.name].value = prop.value.value || "''";
          break;
        case 'NumericLiteral':
        case 'BooleanLiteral':
          props[prop.key.name].value = prop.value.value;
          break;
        default:
          break;
      }
    });
  }

  return props;
};

module.exports = {
  propTypesToObject,
};
