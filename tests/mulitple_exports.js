import React from "react";

export const rCopy = React;
export const nullComp = React.Component(null);
export const nullComp2 = () => React.Component(null);
export const nullComp3 = function myComponent() { return React.Component(null); }

export const CONSTANT_VALUE = 123;
export const CONSTANT_OBJECT = { id: 123 };

const ref = React.Component(null);
export const CONSTANT_REF = ref;

const VAR_REF = React.Component(null);
export default VAR_REF;