import React from 'react';
import {useAuthenticator} from '@aws-amplify/ui-react';

export default function Home() {
    const {user, signOut} = useAuthenticator((context) => [context.user]);

    return (
        <div>
            <h1> This is the app client 1 resources page</h1>
            <h2>Hello {user.username}</h2>
            <button onClick={signOut}>Sign out</button>
        </div>
    );
}
