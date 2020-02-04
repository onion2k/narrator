require('colors');
const { sortRequiredFirst } = require('./sort');

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
      const {
        name, file, imports, pt,
      } = report;

      const srcfile = `./<src>/${file.replace(config.src, '')}`;

      const proptypes = pt || {};

      console.log('File: ', srcfile.brightWhite);
      console.log(
        clipper(`Component: ${name}`, 50).brightYellow,
        imports.react ? clipper('Rct', 4).green : clipper('Rct', 4).red,
        imports['react-redux']
          ? clipper('Rdx', 4).green
          : clipper('Rdx', 4).red,
        imports['prop-types'] ? clipper('PTs', 4).green : clipper('PTs', 4).red,
        Object.keys(proptypes).length
          ? clipper(`Props: ${Object.keys(proptypes).length}`, 10).green
          : clipper('No Props', 10).red,
      );

      if (Object.keys(proptypes).length) {
        const propCount = Object.keys(pt).length;
        const sortedPt = Object.entries(pt).sort(sortRequiredFirst);
        sortedPt.forEach((prop, index) => {
          const type = prop[1].type.string || '';
          let connector = '│';
          if (index === 0) { connector = '┌'; }
          if (index === propCount - 1) { connector = '└'; }
          console.log(
            connector,
            prop[1].required
              ? clipper(prop[0], 16).brightGreen
              : clipper(prop[0], 16).green,
            prop[1].required
              ? clipper(type, 30).brightWhite
              : clipper(type, 30).white,
            typeof prop[1].value === 'object'
              ? clipper('Object', 50)
              : clipper(prop[1].value, 50),
          );
        });
      } else {
        console.log('No proptypes found');
      }
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
          `${callee.init.callee.object.name
          }.${
            callee.init.callee.property.name}`,
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
