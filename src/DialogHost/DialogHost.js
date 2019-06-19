import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

import SignUpDialog from '../dialogs/SignUpDialog/SignUpDialog';
import SignInDialog from '../dialogs/SignInDialog/SignInDialog';
import ResetPasswordDialog from '../dialogs/ResetPasswordDialog/ResetPasswordDialog';
import WelcomeDialog from '../dialogs/WelcomeDialog/WelcomeDialog';
import SettingsDialog from '../dialogs/SettingsDialog/SettingsDialog';

import PropTypes from 'prop-types';

class DialogHost extends Component {
  render() {

    // Properties
    const {
      dialogs,
      parameters,
      functions,
      eventHandlers
    } = this.props;

    // Functions
    const {
      openDialog,
      closeDialog
    } = this.props;

    const signUpDialog = dialogs.signUpDialog;
    const signInDialog = dialogs.signInDialog;
    const resetPasswordDialog = dialogs.resetPasswordDialog;
    const welcomeDialog = dialogs.welcomeDialog;
    const settingsDialog = dialogs.settingsDialog;

    return (
      <React.Fragment>
        <Button onClick={() => openDialog('welcomeDialog')}>Open "welcomeDialog" Dialog</Button>

        <Hidden xsDown>
          <SignUpDialog
            open={signUpDialog.open}

            {...parameters.signUpDialog}

            {...functions.signUpDialog}

            onClose={() => closeDialog('signUpDialog')}

            {...eventHandlers.signUpDialog}
          />

          <SignInDialog
            open={signInDialog.open}

            {...parameters.signInDialog}

            {...functions.signInDialog}

            onClose={() => closeDialog('signInDialog')}

            {...eventHandlers.signInDialog}
          />

          <ResetPasswordDialog
            open={resetPasswordDialog.open}

            {...parameters.resetPasswordDialog}

            {...functions.resetPasswordDialog}

            onClose={() => closeDialog('resetPasswordDialog')}

            {...eventHandlers.resetPasswordDialog}
          />

          <WelcomeDialog
            open={welcomeDialog.open}

            {...parameters.welcomeDialog}

            onClose={() => closeDialog('welcomeDialog')}

            onCancelClick={() => closeDialog('welcomeDialog')}

            {...eventHandlers.welcomeDialog}
          />

          <SettingsDialog
            open={settingsDialog.open}

            {...parameters.settingsDialog}

            onClose={() => closeDialog('settingsDialog')}

            {...eventHandlers.settingsDialog}
          />
        </Hidden>

        <Hidden smUp>
          <SignUpDialog
            fullScreen
            open={signUpDialog.open}

            {...parameters.signUpDialog}

            {...functions.signUpDialog}

            onClose={() => closeDialog('signUpDialog')}

            {...eventHandlers.signUpDialog}
          />

          <SignInDialog
            fullScreen
            open={signInDialog.open}

            {...parameters.signInDialog}

            {...functions.signInDialog}

            onClose={() => closeDialog('signInDialog')}

            {...eventHandlers.signInDialog}
          />

          <ResetPasswordDialog
            fullScreen
            open={resetPasswordDialog.open}

            {...parameters.resetPasswordDialog}

            {...functions.resetPasswordDialog}

            onClose={() => closeDialog('resetPasswordDialog')}

            {...eventHandlers.resetPasswordDialog}
          />

          <WelcomeDialog
            fullScreen
            open={welcomeDialog.open}

            {...parameters.welcomeDialog}

            onClose={() => closeDialog('welcomeDialog')}

            onCancelClick={() => closeDialog('welcomeDialog')}

            {...eventHandlers.welcomeDialog}
          />

          <SettingsDialog
            fullScreen
            open={settingsDialog.open}

            {...parameters.settingsDialog}

            onClose={() => closeDialog('settingsDialog')}

            {...eventHandlers.settingsDialog}
          />
        </Hidden>
      </React.Fragment>
    );
  }
}

DialogHost.propTypes = {

  // Properties
  dialogs: PropTypes.object.isRequired,
  parameters: PropTypes.object,
  eventHandlers: PropTypes.object,

  // Functions
  openDialog: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default DialogHost;