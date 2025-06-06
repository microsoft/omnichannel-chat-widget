import React, {Component} from 'react';

const RenderChildrenFunction = ({ children }: { children: React.ReactNode | (() => React.ReactNode) }) => (typeof children === 'function' ? (children as Function)() : children);

interface ErrorBoundaryProps {
  children: React.ReactNode | (() => React.ReactNode);
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    }
  }

  componentDidCatch(error: Error) {
    const {onError} = this.props;
    this.setState({hasError: true});
    if (onError) {
      onError(error);
    }
  }

  render() {
    const {children} = this.props;
    const {hasError} = this.state;
    return !hasError && <RenderChildrenFunction>{children}</RenderChildrenFunction>;
  }
}

export default ErrorBoundary;