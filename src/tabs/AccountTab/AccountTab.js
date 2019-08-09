import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import Hidden from '@material-ui/core/Hidden';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import PhotoIcon from '@material-ui/icons/Photo';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import PersonIcon from '@material-ui/icons/Person';
import EditIcon from '@material-ui/icons/Edit';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import EmailIcon from '@material-ui/icons/Email';
import WarningIcon from '@material-ui/icons/Warning';
import CheckIcon from '@material-ui/icons/Check';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import validate from 'validate.js';
import moment from 'moment';

import constraints from '../../constraints';
import authentication from '../../authentication';

const styles = (theme) => ({
  dialogContent: {
    paddingTop: theme.spacing(2)
  },

  badge: {
    top: theme.spacing(2),
    right: -theme.spacing(2)
  },

  avatar: {
    marginRight: 'auto',
    marginLeft: 'auto',

    width: theme.spacing(15),
    height: theme.spacing(15)
  },

  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),

    minHeight: 'initial'
  },

  buttonIcon: {
    marginRight: theme.spacing(1)
  }
});

const initialState = {
  profileCompletion: 0,
  securityRating: 0,

  showingField: '',

  avatar: null,
  avatarUrl: '',
  firstName: '',
  lastName: '',
  username: '',
  emailAddress: '',

  isPerformingAuthAction: false,
  hasSentVerificationEmail: false,

  errors: null
};

class AccountTab extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  getNameInitials = () => {
    const { userData, user } = this.props;

    const firstName = userData.firstName;
    const lastName = userData.lastName;
    const username = userData.username;
    const displayName = user.displayName;

    if (firstName && lastName) {
      return firstName.charAt(0) + lastName.charAt(0);
    } else if (firstName) {
      return firstName.charAt(0)
    } else if (lastName) {
      return lastName.charAt(0);
    } else if (username) {
      return username.charAt(0);
    } else if (displayName) {
      return displayName.charAt(0);
    } else {
      return 'NN';
    }
  };

  uploadAvatar = () => {
    const { avatar } = this.state;

    if (!avatar) {
      return;
    }

    this.setState({
      isPerformingAuthAction: true
    }, () => {
      authentication.changeAvatar(avatar).then((value) => {
        this.calculateProfileCompletion(() => {
          this.props.openSnackbar('Changed avatar');
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          default:
            this.props.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false,

          avatar: null,
          avatarUrl: ''
        });
      });
    });
  };

  removeAvatar = () => {
    const { user } = this.props;
    const { avatar, avatarUrl } = this.state;

    if (!user.photoURL && !avatar && !avatarUrl) {
      return;
    }

    if ((!user.photoURL && avatar && avatarUrl) || (user.photoURL && avatar && avatarUrl)) {
      URL.revokeObjectURL(avatarUrl);

      this.setState({
        avatar: null,
        avatarUrl: ''
      }, () => {
        this.props.openSnackbar(`Removed image “${avatar.name}”`, 5);
      });
    } else if (user.photoURL && !avatar && !avatarUrl) {
      this.setState({
        isPerformingAuthAction: true
      }, () => {
        authentication.removeAvatar().then((value) => {
          this.calculateProfileCompletion(() => {
            this.props.openSnackbar('Removed avatar');
          });
        }).catch((reason) => {
          const code = reason.code;
          const message = reason.message;
  
          switch (code) {
            default:
              this.props.openSnackbar(message);
              return;
          }
        }).finally(() => {
          this.setState({
            isPerformingAuthAction: false
          });
        });
      });
    }
  };

  calculateProfileCompletion = (callback) => {
    const { user, userData } = this.props;

    if (!user || !userData) {
      return;
    }

    let profileCompletion = 0;

    const fields = [
      user.photoURL,
      userData.firstName,
      userData.lastName,
      userData.username,
      user.email,
      user.email && user.emailVerified
    ];

    fields.forEach((field) => {
      if (field) {
        profileCompletion += 100 / fields.length;
      }
    });

    this.setState({
      profileCompletion: Math.floor(profileCompletion)
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  calculateSecurityRating = (callback) => {
    const { user, userData } = this.props;

    if (!user || !user.metadata || !userData) {
      return;
    }

    let creationTime = user.metadata.creationTime;

    if (!creationTime) {
      return;
    }

    creationTime = moment(creationTime);

    let lastChangedPassword = userData.lastChangedPassword;
    let securityRating = 0;

    if (lastChangedPassword) {
      lastChangedPassword = moment(lastChangedPassword.toDate());

      if (creationTime.diff(lastChangedPassword, 'days') >= 365.242199) {
        securityRating = 50;
      } else {
        securityRating = 100;
      }
    } else {
      if (moment().diff(creationTime, 'days') >= 365.242199) {
        securityRating = 50;
      } else {
        securityRating = 100;
      }
    }

    this.setState({
      securityRating: securityRating
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  showField = (fieldId) => {
    if (!fieldId) {
      return;
    }

    this.setState({
      showingField: fieldId
    });
  };

  hideFields = (callback) => {
    this.setState({
      showingField: '',

      firstName: '',
      lastName: '',
      username: '',
      emailAddress: '',

      errors: null
    }, () => {
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  };

  changeFirstName = () => {
    const { firstName } = this.state;

    const errors = validate({
      firstName: firstName
    }, {
      firstName: constraints.firstName
    });

    if (errors) {
      this.setState({
        errors: errors
      });

      return;
    }

    this.setState({
      errors: null
    }, () => {
      const { userData } = this.props;

      if (firstName === userData.firstName) {
        return;
      }

      this.setState({
        isPerformingAuthAction: true
      }, () => {
        authentication.changeFirstName(firstName).then(() => {
          this.calculateProfileCompletion(() => {
            this.hideFields(() => {
              this.props.openSnackbar('Changed first name');
            });
          });
        }).catch((reason) => {
          const code = reason.code;
          const message = reason.message;
  
          switch (code) {
            default:
              this.props.openSnackbar(message);
              return;
          }
        }).finally(() => {
          this.setState({
            isPerformingAuthAction: false
          });
        });
      });
    });
  };

  changeLastName = () => {
    const { lastName } = this.state;

    const errors = validate({
      lastName: lastName
    }, {
      lastName: constraints.lastName
    });

    if (errors) {
      this.setState({
        errors: errors
      });

      return;
    }

    this.setState({
      errors: null
    }, () => {
      const { userData } = this.props;

      if (lastName === userData.lastName) {
        return;
      }

      this.setState({
        isPerformingAuthAction: true
      }, () => {
        authentication.changeLastName(lastName).then(() => {
          this.calculateProfileCompletion(() => {
            this.hideFields(() => {
              this.props.openSnackbar('Changed last name');
            });
          });
        }).catch((reason) => {
          const code = reason.code;
          const message = reason.message;
  
          switch (code) {
            default:
              this.props.openSnackbar(message);
              return;
          }
        }).finally(() => {
          this.setState({
            isPerformingAuthAction: false
          });
        });
      });
    });
  };

  changeUsername = () => {
    const { username } = this.state;

    const errors = validate({
      username: username
    }, {
      username: constraints.username
    });

    if (errors) {
      this.setState({
        errors: errors
      });

      return;
    }

    this.setState({
      errors: null
    }, () => {
      const { userData } = this.props;

      if (username === userData.username) {
        return;
      }

      this.setState({
        isPerformingAuthAction: true
      }, () => {
        authentication.changeUsername(username).then(() => {
          this.calculateProfileCompletion(() => {
            this.hideFields(() => {
              this.props.openSnackbar('Changed username');
            });
          });
        }).catch((reason) => {
          const code = reason.code;
          const message = reason.message;
  
          switch (code) {
            default:
              this.props.openSnackbar(message);
              return;
          }
        }).finally(() => {
          this.setState({
            isPerformingAuthAction: false
          });
        });
      });
    });
  };

  changeEmailAddress = () => {
    const { emailAddress } = this.state;

    const errors = validate({
      emailAddress: emailAddress
    }, {
      emailAddress: constraints.emailAddress
    });

    if (errors) {
      this.setState({
        errors: errors
      });

      return;
    }

    this.setState({
      errors: null
    }, () => {
      const { user } = this.props;

      if (emailAddress === user.email) {
        return;
      }

      this.setState({
        isPerformingAuthAction: true
      }, () => {
        authentication.changeEmailAddress(emailAddress).then(() => {
          this.calculateProfileCompletion(() => {
            this.hideFields(() => {
              this.props.openSnackbar('Changed e-mail address');
            });
          });
        }).catch((reason) => {
          const code = reason.code;
          const message = reason.message;
  
          switch (code) {
            default:
              this.props.openSnackbar(message);
              return;
          }
        }).finally(() => {
          this.setState({
            isPerformingAuthAction: false
          });
        });
      });
    });
  };

  verifyEmailAddress = () => {
    this.setState({
      isPerformingAuthAction: true
    }, () => {
      authentication.verifyEmailAddress().then(() => {
        this.setState({
          hasSentVerificationEmail: true
        }, () => {
          this.props.openSnackbar('Sent verification e-mail');
        });
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          default:
            this.props.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  deleteAccount = () => {
    this.setState({
      isPerformingAuthAction: true
    }, () => {
      authentication.deleteAccount().then(() => {
        this.props.openSnackbar('Deleted account');
      }).catch((reason) => {
        const code = reason.code;
        const message = reason.message;

        switch (code) {
          default:
            this.props.openSnackbar(message);
            return;
        }
      }).finally(() => {
        this.setState({
          isPerformingAuthAction: false
        });
      });
    });
  };

  changeField = (fieldId) => {
    switch (fieldId) {
      case 'first-name':
        this.changeFirstName();
        return;

      case 'last-name':
        this.changeLastName();
        return;

      case 'username':
        this.changeUsername();
        return;

      case 'email-address':
        this.changeEmailAddress();
        return;

      default:
        return;
    }
  };

  handleKeyDown = (event, fieldId) => {
    if (!event || !fieldId) {
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const key = event.key;

    if (!key) {
      return;
    }

    if (key === 'Escape') {
      this.hideFields();
    } else if (key === 'Enter') {
      this.changeField(fieldId);
    }
  };

  handleAvatarChange = (event) => {
    if (!event) {
      return;
    }

    const files = event.target.files;

    if (!files) {
      return;
    }

    const avatar = files[0];

    if (!avatar) {
      return;
    }

    const fileTypes = [
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml'
    ];

    if (!fileTypes.includes(avatar.type)) {
      return;
    }

    if (avatar.size > (20 * 1024 * 1024)) {
      return;
    }

    this.setState({
      avatar: avatar,
      avatarUrl: URL.createObjectURL(avatar)
    }, () => {
      this.props.openSnackbar(`Selected image “${avatar.name}”`, 5);
    });
  };

  handleFirstNameChange = (event) => {
    if (!event) {
      return;
    }

    const firstName = event.target.value;

    this.setState({
      firstName: firstName
    });
  };

  handleLastNameChange = (event) => {
    if (!event) {
      return;
    }

    const lastName = event.target.value;

    this.setState({
      lastName: lastName
    });
  };

  handleUsernameChange = (event) => {
    if (!event) {
      return;
    }

    const username = event.target.value;

    this.setState({
      username: username
    });
  };

  handleEmailAddressChange = (event) => {
    if (!event) {
      return;
    }

    const emailAddress = event.target.value;

    this.setState({
      emailAddress: emailAddress
    });
  };

  render() {
    // Styling
    const { classes } = this.props;

    // Properties
    const {
      user,
      userData
    } = this.props;

    const {
      profileCompletion,
      securityRating,

      showingField,

      isPerformingAuthAction,

      avatar,
      avatarUrl,
      firstName,
      lastName,
      username,
      emailAddress,

      hasSentVerificationEmail,

      errors
    } = this.state;

    return (
      <DialogContent classes={{ root: classes.dialogContent }}>
        <Box mb={2}>
          <Hidden xsDown>
            <Grid alignItems="center" container>
              <Grid item xs>
                <Box textAlign="center">
                  <Box mb={1.5}>
                    {(avatar && avatarUrl) &&
                      <Badge classes={{ badge: classes.badge }} badgeContent={
                        <Tooltip title="Remove">
                          <Fab classes={{ sizeSmall: classes.small }} color="secondary" disabled={isPerformingAuthAction} size="small" onClick={this.removeAvatar}>
                            <CloseIcon fontSize="small" />
                          </Fab>
                        </Tooltip>
                      }>
                        <Avatar className={classes.avatar} alt="Avatar" src={avatarUrl} />
                      </Badge>
                    }

                    {(!avatar && !avatarUrl) &&
                      <React.Fragment>
                        {user.photoURL &&
                          <Badge classes={{ badge: classes.badge }} badgeContent={
                            <Tooltip title="Remove">
                              <Fab classes={{ sizeSmall: classes.small }} color="secondary" disabled={isPerformingAuthAction} size="small" onClick={this.removeAvatar}>
                                <CloseIcon fontSize="small" />
                              </Fab>
                            </Tooltip>
                          }>
                            <Avatar className={classes.avatar} alt="Avatar" src={user.photoURL} />
                          </Badge>
                        }

                        {!user.photoURL &&
                          <Avatar className={classes.avatar} alt="Avatar">
                            <Typography variant="h3">{this.getNameInitials()}</Typography>
                          </Avatar>
                        }
                      </React.Fragment>
                    }
                  </Box>

                  {(avatar && avatarUrl) &&
                    <Button color="primary" disabled={isPerformingAuthAction} variant="contained" onClick={this.uploadAvatar}>
                      <CloudUploadIcon className={classes.buttonIcon} />
                      Upload
                    </Button>
                  }

                  {(!avatar && !avatarUrl) &&
                    <React.Fragment>
                      <input
                        id="avatar-input"
                        type="file"
                        hidden
                        accept="image/*"

                        onChange={this.handleAvatarChange}
                      />

                      <label htmlFor="avatar-input">
                        <Button color="primary" component="span" disabled={isPerformingAuthAction} variant="contained">
                          <PhotoIcon className={classes.buttonIcon} />
                          Choose...
                        </Button>
                      </label>
                    </React.Fragment>
                  }
                </Box>
              </Grid>

              <Grid item xs>
                <Box textAlign="center">
                  <Typography variant="body1">Profile Completion</Typography>

                  {profileCompletion === 0 &&
                    <Typography color="error" variant="h5">{profileCompletion}%</Typography>
                  }

                  {profileCompletion === 100 &&
                    <Typography color="primary" variant="h5">{profileCompletion}%</Typography>
                  }

                  {(profileCompletion !== 0 && profileCompletion !== 100)  &&
                    <Typography color="secondary" variant="h5">{profileCompletion}%</Typography>
                  }
                </Box>
              </Grid>

              <Grid item xs>
                <Box textAlign="center">
                  <Typography variant="body1">Security Rating</Typography>

                  {securityRating === 0 &&
                    <Typography color="error" variant="h5">{securityRating}%</Typography>
                  }

                  {securityRating === 100 &&
                    <Typography color="primary" variant="h5">{securityRating}%</Typography>
                  }

                  {(securityRating !== 0 && securityRating !== 100) &&
                    <Typography color="secondary" variant="h5">{securityRating}%</Typography>
                  }
                </Box>
              </Grid>
            </Grid>
          </Hidden>

          <Hidden smUp>
            <Box textAlign="center" mb={3}>
              <Box mb={1.5}>
                {(avatar && avatarUrl) &&
                  <Badge classes={{ badge: classes.badge }} badgeContent={
                    <Tooltip title="Remove">
                      <Fab classes={{ sizeSmall: classes.small }} color="secondary" disabled={isPerformingAuthAction} size="small" onClick={this.removeAvatar}>
                        <CloseIcon fontSize="small" />
                      </Fab>
                    </Tooltip>
                  }>
                    <Avatar className={classes.avatar} alt="Avatar" src={avatarUrl} />
                  </Badge>
                }

                {(!avatar && !avatarUrl) &&
                  <React.Fragment>
                    {user.photoURL &&
                      <Badge classes={{ badge: classes.badge }} badgeContent={
                        <Tooltip title="Remove">
                          <Fab classes={{ sizeSmall: classes.small }} color="secondary" disabled={isPerformingAuthAction} size="small" onClick={this.removeAvatar}>
                            <CloseIcon fontSize="small" />
                          </Fab>
                        </Tooltip>
                      }>
                        <Avatar className={classes.avatar} alt="Avatar" src={user.photoURL} />
                      </Badge>
                    }

                    {!user.photoURL &&
                      <Avatar className={classes.avatar} alt="Avatar">
                        <Typography variant="h3">{this.getNameInitials()}</Typography>
                      </Avatar>
                    }
                  </React.Fragment>
                }
              </Box>

              {(avatar && avatarUrl) &&
                <Button color="primary" disabled={isPerformingAuthAction} variant="contained" onClick={this.uploadAvatar}>
                  <CloudUploadIcon className={classes.buttonIcon} />
                  Upload
                </Button>
              }

              {(!avatar && !avatarUrl) &&
                <React.Fragment>
                  <input
                    id="avatar-input"
                    type="file"
                    hidden
                    accept="image/*"

                    onChange={this.handleAvatarChange}
                  />

                  <label htmlFor="avatar-input">
                    <Button color="primary" component="span" disabled={isPerformingAuthAction} variant="contained">
                      <PhotoIcon className={classes.buttonIcon} />
                      Choose...
                    </Button>
                  </label>
                </React.Fragment>
              }
            </Box>

            <Grid container>
              <Grid item xs>
                <Box textAlign="center">
                  <Typography variant="body1">Profile Completion</Typography>

                  {profileCompletion === 0 &&
                    <Typography color="error" variant="h5">{profileCompletion}%</Typography>
                  }

                  {profileCompletion === 100 &&
                    <Typography color="primary" variant="h5">{profileCompletion}%</Typography>
                  }

                  {(profileCompletion !== 0 && profileCompletion !== 100)  &&
                    <Typography color="secondary" variant="h5">{profileCompletion}%</Typography>
                  }
                </Box>
              </Grid>

              <Grid item xs>
                <Box textAlign="center">
                  <Typography variant="body1">Security Rating</Typography>

                  {securityRating === 0 &&
                    <Typography color="error" variant="h5">{securityRating}%</Typography>
                  }

                  {securityRating === 100 &&
                    <Typography color="primary" variant="h5">{securityRating}%</Typography>
                  }

                  {(securityRating !== 0 && securityRating !== 100) &&
                    <Typography color="secondary" variant="h5">{securityRating}%</Typography>
                  }
                </Box>
              </Grid>
            </Grid>
          </Hidden>
        </Box>

        <List disablePadding>
          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
            </Hidden>

            {!userData.firstName &&
              <ListItemIcon>
                <Tooltip title="No first name">
                  <WarningIcon color="error" />
                </Tooltip>
              </ListItemIcon>
            }

            {showingField === 'first-name' &&
              <TextField
                autoComplete="given-name"
                autoFocus
                disabled={isPerformingAuthAction}
                error={!!(errors && errors.firstName)}
                fullWidth
                helperText={(errors && errors.firstName) ? errors.firstName[0] : 'Press Enter to change your first name'}
                label="First name"
                placeholder={userData.firstName}
                required
                type="text"
                value={firstName}
                variant="filled"

                onBlur={this.hideFields}
                onKeyDown={(event) => this.handleKeyDown(event, 'first-name')}

                onChange={this.handleFirstNameChange}
              />
            }

            {showingField !== 'first-name' &&
              <React.Fragment>
                <ListItemText
                  primary="First name"
                  secondary={userData.firstName ? userData.firstName : 'You don\'t have a first name'}
                />

                <ListItemSecondaryAction>
                  {userData.firstName &&
                    <Tooltip title="Change">
                      <div>
                        <IconButton disabled={isPerformingAuthAction} onClick={() => this.showField('first-name')}>
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  }

                  {!userData.firstName &&
                    <Button
                      color="primary"
                      disabled={isPerformingAuthAction}
                      variant="contained"
                      onClick={() => this.showField('first-name')}>
                      Add
                    </Button>
                  }
                </ListItemSecondaryAction>
              </React.Fragment>
            }
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
            </Hidden>

            {!userData.lastName &&
              <ListItemIcon>
                <Tooltip title="No last name">
                  <WarningIcon color="error" />
                </Tooltip>
              </ListItemIcon>
            }

            {showingField === 'last-name' &&
              <TextField
                autoComplete="family-name"
                autoFocus
                disabled={isPerformingAuthAction}
                error={!!(errors && errors.lastName)}
                fullWidth
                helperText={(errors && errors.lastName) ? errors.lastName[0] : 'Press Enter to change your last name'}
                label="Last name"
                placeholder={userData.lastName}
                required
                type="text"
                value={lastName}
                variant="filled"

                onBlur={this.hideFields}
                onKeyDown={(event) => this.handleKeyDown(event, 'last-name')}

                onChange={this.handleLastNameChange}
              />
            }

            {showingField !== 'last-name' &&
              <React.Fragment>
                <ListItemText
                  primary="Last name"
                  secondary={userData.lastName ? userData.lastName : 'You don\'t have a last name'}
                />

                <ListItemSecondaryAction>
                  {userData.lastName &&
                    <Tooltip title="Change">
                      <div>
                        <IconButton disabled={isPerformingAuthAction} onClick={() => this.showField('last-name')}>
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  }

                  {!userData.lastName &&
                    <Button
                      color="primary"
                      disabled={isPerformingAuthAction}
                      variant="contained"
                      onClick={() => this.showField('last-name')}>
                      Add
                    </Button>
                  }
                </ListItemSecondaryAction>
              </React.Fragment>
            }
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <PersonOutlineIcon />
              </ListItemIcon>
            </Hidden>

            {!userData.username &&
              <ListItemIcon>
                <Tooltip title="No username">
                  <WarningIcon color="error" />
                </Tooltip>
              </ListItemIcon>
            }

            {showingField === 'username' &&
              <TextField
                autoComplete="username"
                autoFocus
                disabled={isPerformingAuthAction}
                error={!!(errors && errors.username)}
                fullWidth
                helperText={(errors && errors.username) ? errors.username[0] : 'Press Enter to change your username'}
                label="Username"
                placeholder={userData.username}
                required
                type="text"
                value={username}
                variant="filled"

                onBlur={this.hideFields}
                onKeyDown={(event) => this.handleKeyDown(event, 'username')}

                onChange={this.handleUsernameChange}
              />
            }

            {showingField !== 'username' &&
              <React.Fragment>
                <ListItemText
                  primary="Username"
                  secondary={userData.username ? userData.username : 'You don\'t have a username'}
                />

                <ListItemSecondaryAction>
                  {userData.username &&
                    <Tooltip title="Change">
                      <div>
                        <IconButton disabled={isPerformingAuthAction} onClick={() => this.showField('username')}>
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  }

                  {!userData.username &&
                    <Button
                      color="primary"
                      disabled={isPerformingAuthAction}
                      variant="contained"
                      onClick={() => this.showField('username')}>
                      Add
                    </Button>
                  }
                </ListItemSecondaryAction>
              </React.Fragment>
            }
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
            </Hidden>

            {user.email &&
              <ListItemIcon>
                <React.Fragment>
                  {user.emailVerified &&
                    <Tooltip title="Verified">
                      <CheckIcon color="primary" />
                    </Tooltip>
                  }

                  {!user.emailVerified &&
                    <Tooltip title="Not verified">
                      <WarningIcon color="error" />
                    </Tooltip>
                  }
                </React.Fragment>
              </ListItemIcon>
            }

            {!user.email &&
              <ListItemIcon>
                <Tooltip title="No e-mail address">
                  <WarningIcon color="error" />
                </Tooltip>
              </ListItemIcon>
            }

            {showingField === 'email-address' &&
              <TextField
                autoComplete="email"
                autoFocus
                disabled={isPerformingAuthAction}
                error={!!(errors && errors.emailAddress)}
                fullWidth
                helperText={(errors && errors.emailAddress) ? errors.emailAddress[0] : 'Press Enter to change your e-mail address'}
                label="E-mail address"
                placeholder={user.email}
                required
                type="email"
                value={emailAddress}
                variant="filled"

                onBlur={this.hideFields}
                onKeyDown={(event) => this.handleKeyDown(event, 'email-address')}

                onChange={this.handleEmailAddressChange}
              />
            }

            {showingField !== 'email-address' &&
              <React.Fragment>
                <ListItemText
                  primary="E-mail address"
                  secondary={user.email ? user.email : 'You don\'t have an e-mail address'}
                />

                {(user.email && !user.emailVerified) &&
                  <Box clone mr={7}>
                    <ListItemSecondaryAction>
                      <Tooltip title="Verify">
                        <div>
                          <IconButton color="secondary" disabled={isPerformingAuthAction || hasSentVerificationEmail} onClick={this.verifyEmailAddress}>
                            <CheckIcon />
                          </IconButton>
                        </div>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </Box>
                }

                <ListItemSecondaryAction>
                  {user.email &&
                    <Tooltip title="Change">
                      <div>
                        <IconButton disabled={isPerformingAuthAction} onClick={() => this.showField('email-address')}>
                          <EditIcon />
                        </IconButton>
                      </div>
                    </Tooltip>
                  }

                  {!user.email &&
                    <Button
                      color="primary"
                      disabled={isPerformingAuthAction}
                      variant="contained"
                      onClick={() => this.showField('email-address')}>
                      Add
                    </Button>
                  }
                </ListItemSecondaryAction>
              </React.Fragment>
            }
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
            </Hidden>

            <ListItemText
              primary="Signed in"
              secondary={moment(user.metadata.lastSignInTime).format('LLLL')}
            />
          </ListItem>

          <ListItem>
            <Hidden xsDown>
              <ListItemIcon>
                <DeleteForeverIcon />
              </ListItemIcon>
            </Hidden>

            <ListItemText
              primary="Delete account"
              secondary="Accounts cannot be recovered"
            />

            <ListItemSecondaryAction>
              <Button color="secondary" disabled={isPerformingAuthAction} variant="contained" onClick={this.deleteAccount}>Delete</Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </DialogContent>
    );
  }

  componentDidMount() {
    this.calculateProfileCompletion();
    this.calculateSecurityRating();
  }

  componentWillUnmount() {
    const { avatarUrl } = this.state;

    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);

      this.setState({
        avatarUrl: ''
      });
    }
  }
}

AccountTab.propTypes = {
  // Styling
  classes: PropTypes.object.isRequired,

  // Properties
  user: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

  // Functions
  openSnackbar: PropTypes.func.isRequired
};

export default withStyles(styles)(AccountTab);