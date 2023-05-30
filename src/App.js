import React, { useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import awsconfig from './aws-exports';

import {
  Alert,
  AppLayout,
  Button,
  Box,
  Container,
  ContentLayout,
  Header,
  Link,
  SpaceBetween,
  SideNavigation,
  Spinner,
} from '@cloudscape-design/components';

Amplify.configure(awsconfig);

const APP_NAME = 'Lion';

async function globalSignOut() {
  try {
    await Auth.signOut();
    await Auth.signOut({ global: true });
  } catch (error) {
    console.log('error signing out: ', error);
  }
}

const UnauthedUser = () => {
  return (
    <Box textAlign='center'>
      <p>
        <img alt='lion pic' src='https://c4.wallpaperflare.com/wallpaper/595/946/333/digital-art-white-lion-black-lion-wallpaper-preview.jpg' width='50%' />
      </p>
      <p>Login in to see more</p>
      <Button onClick={() => Auth.federatedSignIn()}>
        Login
      </Button>{' '}
    </Box>
  );
};

const AuthedUser = () => {
  return (
    <Box textAlign='center'>
      <p>
        <img alt='lion' src='https://i.etsystatic.com/39641448/r/il/7921b5/4582322301/il_340x270.4582322301_btnp.jpg' width='50%' />
      </p>
      <h2>
        {' '}
        You can try <Button onClick={() => globalSignOut()}>Sign Out</Button>
      </h2>
    </Box>
  );
};

const AuthButton = ({ user }) => {
  return user ?
    <Button onClick={() => globalSignOut()}>Sign Out</Button>
    :
    <Button onClick={() => Auth.federatedSignIn()}>Login</Button>
    ;
};

const DispContent = ({ loading, user }) => {
  if (loading) return <Spinner />;

  if (user) {
    const userGroups = user.signInUserSession.accessToken.payload["cognito:groups"];

    if (userGroups) {
      const index = userGroups.findIndex(element => {
        return element.toLowerCase() === APP_NAME.toLowerCase();
      });

      if (index !== -1) {
        return (
          <AuthedUser user={user} />
        );
      }
    }

    return (
      <Box textAlign='center'>
        <p>
          <img alt='Oops!' src='https://www.pngitem.com/pimgs/m/253-2530285_oops-sticker-onomatopeya-hd-png-download.png' width='50%' />
        </p>
        <p>You are not authorized to view this page</p>
      </Box>
    );

  }
  return <UnauthedUser />;
};

const DispHeader = ({ loading, user }) => {
  if (loading) return <p></p>;
  let displayName = user.signInUserSession.idToken.payload.given_name;
  if (!displayName && user.signInUserSession.idToken.payload.email) {
    displayName = user.signInUserSession.idToken.payload.email;
  }
  return user ? <p>Hi, {displayName}</p> : <p>No User Signed In</p>;
};

const AppBody = ({ loading, user }) => {
  return (
    <ContentLayout
      header={
        <SpaceBetween size='m'>
          <Header
            variant='h1'
            info={<Link>Info</Link>}
            description='Test SSO for different domains Applications.'
            actions={<AuthButton user={user} />}
          >
            Application LION
          </Header>

          <Alert>
            This is a test application under domain{' '}
            <Link>http://{window.location.host}</Link>
          </Alert>
        </SpaceBetween>
      }
    >
      <Container
        header={
          <Header
            variant='h2'
          >
            <DispHeader loading={loading} user={user} />
          </Header>
        }
      >
        <DispContent loading={loading} user={user} />
      </Container>
    </ContentLayout>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          setLoading(false);
          setUser(data);
          break;
        case 'signOut':
          setLoading(false);
          setUser(null);
          break;
        default:
          break;
      }
    });

    setLoading(true);
    Auth.currentAuthenticatedUser()
      .then((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        console.log('Not signed in');
      });

    return unsubscribe;
  }, []);

  console.log('loading:', loading, ' user:', user);

  return (
    <AppLayout
      navigation={<SideNavigation />}
      navigationOpen={false}
      content={<AppBody loading={loading} user={user} />}
      toolsOpen={false}
      tools={null}
      onToolsChange={() => null}
      onNavigationChange={() => null}
    />
  );
}
