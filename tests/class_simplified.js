import React from "react";

class Example extends React.Component {
  shouldComponentUpdate(nextProps) {
    return true;
  }

  render() {
    return <div>{this.props.content}</div>;
  }
}

export default Example;
