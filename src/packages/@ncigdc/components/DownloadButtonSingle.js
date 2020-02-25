import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Button from '@ncigdc/uikit/Button';
import { withTheme } from '@ncigdc/theme';
import DownloadIcon from '@ncigdc/theme/icons/Download';
import Hidden from '@ncigdc/components/Hidden';
import Color from 'color';

const styles = {
		  button: theme => ({
		    padding: '3px 5px',
		    height: '22px',
		    border: `1px solid ${theme.greyScale4}`,
		  }),
		  inactive: theme => ({
		    backgroundColor: 'white',
		    color: theme.greyScale2,
		    ':hover': {
		      backgroundColor: theme.greyScale6,
		    },
		  }),
		  active: theme => ({
		    backgroundColor: theme.success,
		    color: '#fff',
		    ':hover': {
		      backgroundColor: Color(theme.success)
		        .darken(0.3)
		        .rgbString(),
		    },
		  }),
		};

const DownloadButtonSingle = ({
	  dispatch,
	  file,
	  files,
	  theme,
	  style,
	  asIcon = false,
	}) => (
	  <Button
	    className="test-download"
	    style={{
	      ...styles.button(theme)
	    }}
	    onClick={() => dispatch(toggleFilesInCart(file))}
	    aria-label="Download file"
	  >
	    <DownloadIcon
	      style={{
	        color: '#fff',
	      }}
	    />
	    <Hidden>Download file</Hidden>
	  </Button>
	);

export default compose(connect(state => state.cart), withTheme)(
  DownloadButtonSingle,
);