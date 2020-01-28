import React from "react";

export const rCopy = React;
export const nullComp = React.Component(null);

export const nullComp2 = React.Component(<div>Hello</div>);
export const nullComp3 = function myComponent() { return React.Component(null); }

export const CONSTANT_VALUE = 123;
export const CONSTANT_OBJECT = { id: 123 };

const ref = React.Component(null);
export const CONSTANT_REF = ref;

const VAR_REF = React.Component(null);
export default VAR_REF;

const nullClassRef = class extends React.Component {}
export { nullClassRef }

export class nullClass extends React.Component {}

export class rCopyClass {}

export class Example extends React.Component {
  static propTypes = {
    selectorContent: PropTypes.func.isRequired,
    propFunction: PropTypes.func.isRequired,
    content: PropTypes.string
  };

  static defaultProps = {
    content: "Default content"
  };

  shouldComponentUpdate(nextProps) {
    return true;
  }

  render() {
    const { content } = this.props;
    return <div>{content}</div>;
  }
}