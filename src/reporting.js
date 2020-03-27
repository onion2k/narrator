require('colors');
const { sortRequiredFirst } = require('./lib/sort');

const config = require('./narrator.config.json');

function clipper(str, percent) {
  if (typeof str !== 'string') return '';

  const termWidth = process.stdout.columns;
  const width = Math.floor((termWidth / 100) * percent);

  if (str.length > width) {
    return str.toString().substring(0, width);
  }
  return str.toString().padEnd(width);
}

module.exports = {
  reporter: (reports) => {
    reports.forEach((report) => {
      const { file, imports } = report;

      const srcfile = `  File: ./<src>/${file.replace(config.src, '')}`;
      console.log();
      console.log(
        clipper(srcfile.brightWhite, 72),
        imports.react ? clipper('React', 6).green : clipper('React', 6).red,
        imports['react-redux']
          ? clipper('Redux', 6).green
          : clipper('Redux', 6).red,
        imports['prop-types']
          ? clipper('Props', 6).green
          : clipper('Props', 6).red,
      );

      report.exports.forEach((exp) => {
        const {
          name,
          type,
          pt,
          super: superClass,
          methods,
          properties,
          default: def,
        } = exp;

        /**
         * Export header - name, type, super etc
         */
        console.log(
          '  Export: ',
          def ? 'Default'.brightBlue : '',
          name ? name.brightGreen : 'anonymous'.brightGreen,
          type ? type.brightYellow : '',
          type === 'Class' && superClass
            ? `extends ${superClass.brightYellow}`
            : '',
        );

        /**
         * Class related values
         */
        if (type === 'Class') {
          console.log(
            '  Methods: ',
            methods.length
              ? clipper(methods.length.toString(), 15)
              : clipper('N/A', 15),
            '  Properties: ',
            properties.length
              ? clipper(properties.length.toString(), 15)
              : clipper('N/A', 15),
          );
        }

        /**
         * If this is a function (eg functional component) we want to know what it returns
         */
        console.log('  Returns: ');

        /**
         * Components should have proptypes
         */
        console.log('  PropTypes: ');
        const proptypes = pt || {};
        if (Object.keys(proptypes).length) {
          const propCount = Object.keys(pt).length;
          const sortedPt = Object.entries(pt).sort(sortRequiredFirst);
          sortedPt.forEach((prop, index) => {
            const proptype = prop[1].type.string || '';
            let connector = '│';
            if (index === 0) {
              connector = '┌';
            }
            if (index === propCount - 1) {
              connector = '└';
            }
            console.log(
              connector,
              prop[1].required
                ? clipper(prop[0], 16).brightGreen
                : clipper(prop[0], 16).green,
              prop[1].required
                ? clipper(proptype, 30).brightWhite
                : clipper(proptype, 30).white,
              typeof prop[1].value === 'object'
                ? clipper('Object', 50)
                : clipper(prop[1].value, 50),
            );
          });
        } else {
          console.log('    No proptypes found');
        }
      });
    });
  },
  def: (type, x) => {
    if (x === null) {
      // console.log(type.padEnd(15), "NULL", identifierName );
      return;
    }
    if (x.type === 'ClassDeclaration') {
      let className = '(Class)';
      if (x.superClass) {
        switch (x.superClass.type) {
          case 'MemberExpression':
            className = `(Class extends ${x.superClass.object.name}.${x.superClass.property.name})`;
            break;
          case 'Identifier':
            className = `(Class extends ${x.superClass.name})`;
            break;
          default:
            console.log(className);
            break;
        }
      }
      // console.log(type.padEnd(15), className, identifierName );
    } else if (x.type === 'VariableDeclaration') {
      // console.log(type.padEnd(15), '(Variable)', identifierName );
    } else {
      // console.log(type.padEnd(15),'(No idea)', identifierName );
    }
  },
  callInterogator: (callee) => {
    switch (callee.init.type) {
      case 'Identifier':
        /**
         * A variable
         */
        console.log('Identifier :', callee.init.name);
        break;
      case 'CallExpression':
        /**
         * An object call
         */
        console.log(
          'Call :',
          `${callee.init.callee.object.name}.${callee.init.callee.property.name}`,
        );
        break;
      case 'ArrowFunctionExpression':
        /**
         * Unnamed arrow function
         */
        console.log('ArrowFunction :', callee.init.id);
        break;
      case 'FunctionExpression':
        /**
         * Named function
         */
        console.log('Function:', callee.init.id.name);
        break;
      case 'StringLiteral':
      case 'NumericLiteral':
        console.log(callee.init.type, ':', callee.init.value);
        break;
      case 'ObjectExpression':
        console.log(
          'Object : ',
          callee.init.properties.map((prop) => prop.key.name),
        );
        break;
      default:
        console.log(callee.init.type);
        break;
    }
  },
};
