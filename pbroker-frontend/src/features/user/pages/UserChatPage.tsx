import React from 'react';
import TawkWidget from '../../tawk/presentation/TawkWidget';
import { useAuthStore } from '../../auth/store/store';

const ChatPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const name = user ? `${user.firstName} ${user.lastName}` : undefined;
  const email = user?.email;
  const userId = user?.id ? String(user.id) : undefined;

  return (
    <div>
      {/* <h2>Live Chat</h2> */}
      <TawkWidget 
        propertyId="68512c5953810b190ffa393c" 
        widgetId="1ituhagam" 
        name={name}
        email={email}
        userId={userId}
      />
      {/* Add other ChatPage UI here */}
    </div>
  );
};

export default ChatPage;
