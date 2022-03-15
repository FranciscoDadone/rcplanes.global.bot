import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import axios from 'axios';

export const context = createContext<any>(undefined);

export default function Context(props: PropsWithChildren<any>) {
  const { children } = props;

  const [user, setUser] = useState<any>();

  useEffect(() => {
    axios
      .get('http://localhost:8080/auth/user', {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
      });
  }, []);

  return <context.Provider value={user}>{children}</context.Provider>;
}
