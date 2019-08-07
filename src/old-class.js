if (classDecs.length === 1) {
    if (classDecs[0].superClass) {
      if (
        classDecs[0].superClass.object &&
        classDecs[0].superClass.object.name === "React"
      ) {
        const name = changeCase.camel(classDecs[0].id.name);
        const pt = await getPt(classDecs);
        renderProps = {
          path: relativeComponentPathWithoutExtension,
          name: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
          as: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
          props: pt
        };
        ptProm = Promise.resolve(renderProps);
      }
    }
  } else
