function declarationParamsToObject(declaration) {
  if (declaration.params) {
    const pt = {};
    let objCount = 0;
    // need to evaluate what each param actually is ...
    declaration.params.forEach(param => {
      if (param.type === 'ObjectPattern') {
        // destructured object
        objCount++
        pt[`obj${objCount}`] = {
          type: { string: 'Object' },
          value: {},
          required: false
        };
        param.properties.forEach(element => {
          /** Loop through obj properties */
          switch (element.value.type) {
            case "Identifier":
              /** Identifier doesn't have a default assignment, so it's a required prop */
              pt[`obj${objCount}`].value[element.key.name] = {
                type: { string: 'PropTypes.any' },
                value: '',
                required: true
              };
              break;
            case "AssignmentPattern":
              /** Assignment does have a default assignment, so it's not a required prop */
              pt[`obj${objCount}`].value[element.key.name] = {
                type: { string: element.value.right.type },
                value: element.value.right.value || "Function",
                required: false
              };
              break;
          }
        })
      } else if (param.type === 'AssignmentPattern') {
        // expand using the same recusrive function as propttypes based on types
        pt[param.left.name] = {
          type: { string: param.right.type },
          value: param.right.value,
          required: false
        };
      } else if (param.type === 'Identifier') {
        pt[param.name] = {
          type: { string: 'PropTypes.any'},
          value: '',
          required: false
        };
      }
    });

    return pt;

  }

}

module.exports = {
  declarationParamsToObject
}