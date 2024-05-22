import React from 'react';
import PropTypes from 'prop-types';


export const ImagePreview = ({ dataUri, isFullscreen }: any) => {
  let classNameFullscreen = isFullscreen ? 'demo-image-preview-fullscreen' : '';

  return (
    <div className={'demo-image-preview ' + classNameFullscreen}>
      <img src={dataUri} width={"100%"}/>
    </div>
  );
};

ImagePreview.propTypes = {
  dataUri: PropTypes.string,
  isFullscreen: PropTypes.bool
};

export default ImagePreview;