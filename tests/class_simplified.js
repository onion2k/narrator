import React from "react";

export default class Example extends React.Component {
  shouldComponentUpdate(nextProps) {
    return true;
  }

  render() {
    return <div>{this.props.content}</div>;
  }
}
