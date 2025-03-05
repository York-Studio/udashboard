import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type
interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

// Initial mock users
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    username: 'manager',
    password: 'password123',
    name: 'Restaurant Manager',
    role: 'manager',
  },
  {
    id: '3',
    username: 'chef',
    password: 'password123',
    name: 'Head Chef',
    role: 'staff',
  },
  {
    id: '4',
    username: 'waiter',
    password: 'password123',
    name: 'Senior Waiter',
    role: 'staff',
  },
];

// Define the AuthContext interface
interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'> & { id: string }) => boolean;
  removeUser: (userId: string) => boolean;
  updateUser: (userId: string, userData: Partial<Omit<User, 'id' | 'password'>>) => boolean;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  addUser: () => false,
  removeUser: () => false,
  updateUser: () => false,
});

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check local storage for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    // For demo purposes, we're checking against hardcoded users
    // In a real app, you would make an API call to authenticate
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // Remove password before storing in state / localStorage
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
      
      // Store in localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Add user function
  const addUser = (newUser: Omit<User, 'id'> & { id: string }): boolean => {
    try {
      // Check if username already exists
      if (users.some(u => u.username === newUser.username)) {
        return false;
      }
      
      setUsers(prevUsers => [...prevUsers, newUser as User]);
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  };

  // Remove user function
  const removeUser = (userId: string): boolean => {
    try {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  };

  // Update user function
  const updateUser = (
    userId: string, 
    userData: Partial<Omit<User, 'id' | 'password'>>
  ): boolean => {
    try {
      let updated = false;
      
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === userId) {
            updated = true;
            return { ...u, ...userData };
          }
          return u;
        })
      );
      
      // If the updated user is the current user, update the user state and localStorage
      if (updated && user && user.id === userId) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updated;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated,
        login,
        logout,
        addUser,
        removeUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 