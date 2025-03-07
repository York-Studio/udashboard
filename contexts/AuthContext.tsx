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
  {
    id: '5',
    username: 'Andy',
    password: 'AndyL2025',
    name: 'Andy Lennox',
    role: 'admin',
  },
];

// Utility functions for user storage
const UserStorage = {
  getUsers: (): User[] => {
    try {
      const storedUsers = localStorage.getItem('restaurant_dashboard_users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          return parsedUsers;
        }
      }
      // If no valid data found, initialize with default users and save
      UserStorage.saveUsers(initialUsers);
      return initialUsers;
    } catch (error) {
      console.error('Error loading users:', error);
      // If error, reset to initial users
      UserStorage.saveUsers(initialUsers);
      return initialUsers;
    }
  },
  
  saveUsers: (users: User[]): void => {
    try {
      localStorage.setItem('restaurant_dashboard_users', JSON.stringify(users));
      console.log('Users saved successfully:', users.length);
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },
  
  clearUsers: (): void => {
    localStorage.removeItem('restaurant_dashboard_users');
  }
};

// Define the AuthContext interface
export interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'> & { id: string }) => boolean;
  removeUser: (userId: string) => boolean;
  updateUser: (userId: string, userData: Partial<Omit<User, 'id' | 'password'>>) => boolean;
  resetUsers: () => void; // Added function to reset users to initial state
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  logout: () => {},
  addUser: () => false,
  removeUser: () => false,
  updateUser: () => false,
  resetUsers: () => {},
});

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize on mount
  useEffect(() => {
    // Load current user if available
    const storedUser = localStorage.getItem('restaurant_dashboard_current_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('restaurant_dashboard_current_user');
      }
    }

    // Load all users
    setUsers(UserStorage.getUsers());
    setLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    // Get latest users from storage
    const currentUsers = UserStorage.getUsers();
    
    // Find matching user
    const foundUser = currentUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // Remove password before storing in state / localStorage
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
      
      // Update users state with latest from storage
      setUsers(currentUsers);
      
      // Store current user in localStorage
      localStorage.setItem('restaurant_dashboard_current_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('restaurant_dashboard_current_user');
  };

  // Add user function
  const addUser = (newUser: Omit<User, 'id'> & { id: string }): boolean => {
    try {
      // Get fresh users data
      const currentUsers = UserStorage.getUsers();
      
      // Check if username already exists
      if (currentUsers.some(u => u.username === newUser.username)) {
        return false;
      }
      
      // Add the new user
      const updatedUsers = [...currentUsers, newUser as User];
      
      // Save to storage
      UserStorage.saveUsers(updatedUsers);
      
      // Update state
      setUsers(updatedUsers);
      
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      return false;
    }
  };

  // Remove user function
  const removeUser = (userId: string): boolean => {
    try {
      // Get fresh users data
      const currentUsers = UserStorage.getUsers();
      
      // Filter out the user to remove
      const updatedUsers = currentUsers.filter(u => u.id !== userId);
      
      // Save to storage
      UserStorage.saveUsers(updatedUsers);
      
      // Update state
      setUsers(updatedUsers);
      
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
      // Get fresh users data
      const currentUsers = UserStorage.getUsers();
      
      let updated = false;
      
      // Update the specific user
      const updatedUsers = currentUsers.map(u => {
        if (u.id === userId) {
          updated = true;
          return { ...u, ...userData };
        }
        return u;
      });
      
      if (!updated) {
        return false;
      }
      
      // Save to storage
      UserStorage.saveUsers(updatedUsers);
      
      // Update state
      setUsers(updatedUsers);
      
      // If the updated user is the current user, update the user state and localStorage
      if (user && user.id === userId) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('restaurant_dashboard_current_user', JSON.stringify(updatedUser));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };
  
  // Reset users to initial state
  const resetUsers = () => {
    UserStorage.saveUsers(initialUsers);
    setUsers(initialUsers);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated,
        loading,
        login,
        logout,
        addUser,
        removeUser,
        updateUser,
        resetUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 