import React from 'react';
import PropTypes from 'prop-types';

import style from './style';

import reflowable from './reflowable';

const namespaceProps = {
  'xmlns': 'http://www.w3.org/2000/svg',
  'xmlns:cc': 'http://creativecommons.org/ns#',
  'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
};
const metadata = `<rdf:rdf>
 <cc:license rdf:about="http://creativecommons.org/licenses/by/3.0/">
    <cc:permits rdf:resource="http://creativecommons.org/ns#Reproduction"></cc:permits>
    <cc:permits rdf:resource="http://creativecommons.org/ns#Distribution"></cc:permits>
    <cc:requires rdf:resource="http://creativecommons.org/ns#Notice"></cc:requires>
    <cc:requires rdf:resource="http://creativecommons.org/ns#Attribution"></cc:requires>
    <cc:permits rdf:resource="http://creativecommons.org/ns#DerivativeWorks"></cc:permits>
  </cc:license>
</rdf:rdf>`;

@reflowable
class Image extends React.PureComponent {
  static defaultProps = {
    padding: 10
  }

  state = {
    width: 0,
    height: 0
  }

  svg = React.createRef()

  children = [React.createRef()]

  async svgUrl(type) {
    const markup = this.svg.current.outerHTML;
    return new Blob([markup], { type });
  }

  async pngUrl(type) {
    const markup = this.svg.current.outerHTML;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const loader = new window.Image(); // Using window.Image to avoid name conflict :(

    loader.width = canvas.width = Number(this.svg.current.getAttribute('width')) * 2;
    loader.height = canvas.height = Number(this.svg.current.getAttribute('height')) * 2;

    await new Promise(resolve => {
      loader.onload = resolve;
      loader.src = 'data:image/svg+xml,' + encodeURIComponent(markup);
    });

    context.drawImage(loader, 0, 0, loader.width, loader.height);
    return new Promise(resolve => canvas.toBlob(resolve, type));
  }

  reflow() {
    const { padding } = this.props;
    const box = this.children[0].current.getBBox();

    this.setStateAsync({
      width: Math.round(box.width + 2 * padding),
      height: Math.round(box.height + 2 * padding)
    });
  }

  render() {
    const { width, height } = this.state;
    const { padding, children } = this.props;

    const svgProps = {
      width,
      height,
      viewBox: [0, 0, width, height].join(' '),
      style: style.image,
      ref: this.svg,
      ...namespaceProps
    };

    return <svg { ...svgProps }>
      <metadata dangerouslySetInnerHTML={{ __html: metadata }}></metadata>
      <g transform={ `translate(${ padding } ${ padding })` }>
        { React.cloneElement(React.Children.only(children), {
          ref: this.children[0]
        }) }
      </g>
    </svg>;
  }
}

Image.propTypes = {
  children: PropTypes.node,
  padding: PropTypes.number
};

export default Image;
