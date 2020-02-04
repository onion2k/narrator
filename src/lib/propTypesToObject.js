const jsonata = require("jsonata");
const { find } = require("../lib/AST.js");

const propTypesProperties = jsonata("properties");
const defaultPropsProperties = jsonata("properties");

function parsePropChain(proptype) {
  let prop = proptype.value || proptype;
  const chain = [];
  try {
    if (typeof prop === "object" && prop !== null) {
      while (prop.hasOwnProperty("object") || prop.hasOwnProperty("callee")) {
        if (prop.hasOwnProperty("object")) {
          chain.push(prop.property.name);
          prop = prop.object;
        } else if (prop.hasOwnProperty("callee")) {
          const args = [];
          if (prop.hasOwnProperty("arguments")) {
            prop.arguments.forEach(arg => {
              if (arg.hasOwnProperty("elements")) {
                arg.elements.forEach(el => {
                  args.push(
                    parsePropChain(el)
                      .reverse()
                      .join(".")
                  );
                });
              }
            });
          }
          if (prop.callee.hasOwnProperty("property")) {
            chain.push(`${prop.callee.property.name}[${args.join(",")}]`);
          } else {
            chain.push(`${prop.callee.name}[${args.join(",")}]`);
          }
          if (prop.callee.hasOwnProperty("object")) {
            prop = prop.callee.object;
          } else {
            prop = false;
          }
        }
      }
      chain.push(prop.name);
    }
  } catch (e) {
    console.error("Failed to parse prop chain.", proptype);
    process.exit(1);
  }
  return chain;
}

const propTypesToObject = ({ pt, pd }, b, file = null) => {
  const propTypes = propTypesProperties.evaluate(pt);
  const defaultProps = defaultPropsProperties.evaluate(pd);

  let props = {};
  if (propTypes) {
    propTypes.forEach(prop => {
      const chain = parsePropChain(prop);
      const required = chain[0] === "isRequired";
      chain.reverse();
      props[prop.key.name] = {
        type: prop.value.type,
        value: "",
        type: { string: chain.join("."), chain: chain },
        required
      };
    });
  }

  if (defaultProps) {
    defaultProps.forEach(prop => {
      switch (prop.value.type) {
        case "ArrayExpression":
          props[prop.key.name].value = prop.value.elements.map(
            element => element.value
          );
          break;
        case "ObjectExpression":
          props[prop.key.name].value = prop.value.properties.reduce(
            (i, element) => {
              i[element.key.name] = element.value.value;
              return i;
            },
            {}
          );
          break;
        case "NullLiteral":
          if (props[prop.key.name].type.string === "PropTypes.node") {
            props[prop.key.name].value = "Component";
          } else {
            props[prop.key.name].value = "null";
          }
          break;
        case "MemberExpression":
          props[prop.key.name].value =
            prop.value.object.name + "." + prop.value.property.name;
          break;
        case "Identifier":
          const x = find(b, prop.key.name);
          if (typeof x === "object" && x !== null) {
            switch (x.type) {
              case "ImportDeclaration":
                props[prop.key.name].value =
                  prop.value.name + " from " + x.source.value;
                break;
              case "FunctionDeclaration":
                props[prop.key.name].value =
                  prop.value.name + " from line " + x.id.start;
                break;
            }
          } else {
            if (x === null) {
              props[prop.key.name].value = "NULL";
            } else {
              props[prop.key.name].value = x;
            }
          }
          break;
        case "StringLiteral":
          props[prop.key.name].value = prop.value.value || "''";
          break;
        case "NumericLiteral":
        case "BooleanLiteral":
          props[prop.key.name].value = prop.value.value;
          break;
      }
    });
  }

  return props;
};

module.exports = {
  propTypesToObject
};
