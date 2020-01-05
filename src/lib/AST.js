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
          type: 'Object',
          value: {},
          required: false
        };
        param.properties.forEach(element => {
          switch (element.value.type) {
            case "Identifier":
              pt[`obj${objCount}`].value[element.key.name] = {
                type: '',
                value: '',
                required: true
              };
              break;
            case "AssignmentPattern":
              // If it's an assignment then there's a default, so it's not required
              pt[`obj${objCount}`].value[element.key.name] = {
                type: element.value.right.type,
                value: element.value.right.value || "Function",
                required: false
              };
              break;
          }
        })
      } else if (param.type === 'AssignmentPattern') {
        // expand using the same recusrive function as propttypes based on types
        pt[param.left.name] = {
          type: param.right.type,
          value: param.right.value,
          required: false
        };
      } else if (param.type === 'Identifier') {
        pt[param.name] = {
          type: '',
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