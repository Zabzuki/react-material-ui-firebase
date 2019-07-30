import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { createMuiTheme, withStyles, MuiThemeProvider } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import FacebookBoxIcon from 'mdi-material-ui/FacebookBox';
import GitHubCircleIcon from 'mdi-material-ui/GithubCircle';
import GoogleIcon from 'mdi-material-ui/Google';
import MicrosoftIcon from 'mdi-material-ui/Microsoft';
import TwitterIcon from 'mdi-material-ui/Twitter';
import YahooIcon from 'mdi-material-ui/Yahoo';

import settings from '../../settings';

const styles = (theme) => ({
  grid: {
    marginBottom: theme.spacing(2)
  },

  icon: {
    marginRight: theme.spacing(0.5)
  }
});

class AuthProviderList extends Component {
  render() {
    // Styling
    const { classes } = this.props;

    // Properties
    const { gutterBottom, isPerformingAuthAction } = this.props;

    // Events
    const { onAuthProviderClick } = this.props;

    const authProviders = [
      {
        providerId: 'facebook.com',
        theme: createMuiTheme({
          palette: {
            primary: {
              main: '#3c5a99',
              contrastText: '#ffffff'
            }
          }
        }),
        icon: <FacebookBoxIcon className={classes.icon} />,
        name: 'Facebook'
      },
      {
        providerId: 'github.com',
        theme: createMuiTheme({
          palette: {
            primary: {
              main: '#24292e',
              contrastText: '#ffffff'
            }
          }
        }),
        icon: <GitHubCircleIcon className={classes.icon} />,
        name: 'GitHub'
      },
      {
        providerId: 'google.com',
        theme: createMuiTheme({
          palette: {
            primary: {
              main: '#4285f4',
              contrastText: '#ffffff'
            }
          }
        }),
        icon: <GoogleIcon className={classes.icon} />,
        name: 'Google'
      },
      {
        providerId: 'microsoft.com',
        theme: createMuiTheme({
          palette: {
            primary: {
              main: '#f65314',
              contrastText: '#ffffff'
            }
          }
        }),
        icon: <MicrosoftIcon className={classes.icon} />,
        name: 'Microsoft'
      },
      {
        providerId: 'twitter.com',
        theme: createMuiTheme({
          palette: {
            primary: {
              main: '#1da1f2',
              contrastText: '#ffffff'
            }
          }
        }),
        icon: <TwitterIcon className={classes.icon} />,
        name: 'Twitter'
      },
      {
        providerId: 'yahoo.com',
        theme: createMuiTheme({
          palette: {
            primary: {
              main: '#410093',
              contrastText: '#ffffff'
            }
          }
        }),
        icon: <YahooIcon className={classes.icon} />,
        name: 'Yahoo'
      }
    ];

    return (
      <Grid className={gutterBottom && classes.grid} container direction="column" spacing={1}>
        {authProviders.map((authProvider) => {
          if (!settings.authProviders.includes(authProvider.providerId)) {
            return null;
          }

          return (
            <Grid key={authProvider.providerId} item>
              <MuiThemeProvider theme={authProvider.theme}>
                <Button
                  color="primary"
                  disabled={isPerformingAuthAction}
                  fullWidth
                  variant="contained"
                  onClick={() => onAuthProviderClick(authProvider.providerId)}>
                  {authProvider.icon}
                  {authProvider.name}
                </Button>
              </MuiThemeProvider>
            </Grid>
          );
        })}
      </Grid>
    );
  }
}

AuthProviderList.propTypes = {
  // Styling
  classes: PropTypes.object.isRequired,

  // Properties
  gutterBottom: PropTypes.bool,
  isPerformingAuthAction: PropTypes.bool,

  // Events
  onAuthProviderClick: PropTypes.func.isRequired
};

export default withStyles(styles)(AuthProviderList);