import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing saved coffees state
 * Provides functions to save/unsave coffees and check saved status
 * 
 * @param userId - ID of the authenticated user
 * @returns Object containing saved coffees state and management functions
 */
export const useSavedCoffees = (userId?: string) => {
  const [savedCoffees, setSavedCoffees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the user's saved coffees from the API
   */
  const fetchSavedCoffees = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/saved-coffees?userId=${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Extract just the coffee IDs for easy checking
          const coffeeIds = result.data.map((saved: any) => saved.coffeeId);
          setSavedCoffees(coffeeIds);
        }
      } else {
        setError('Failed to fetch saved coffees');
      }
    } catch (error) {
      console.error('Error fetching saved coffees:', error);
      setError('Failed to fetch saved coffees');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Saves a coffee to the user's profile
   * 
   * @param coffeeId - ID of the coffee to save
   * @param coffeeData - Coffee information to save
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  const saveCoffee = useCallback(async (coffeeId: string, coffeeData: any): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const response = await fetch('/api/saved-coffees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          coffeeId,
          coffeeData
        })
      });
      
      if (response.ok) {
        setSavedCoffees(prev => [...prev, coffeeId]);
        return true;
      } else {
        const result = await response.json();
        if (response.status === 409) {
          // Already saved, just add to local state
          setSavedCoffees(prev => [...prev, coffeeId]);
          return true;
        } else {
          setError(result.error || 'Failed to save coffee');
          return false;
        }
      }
    } catch (error) {
      console.error('Error saving coffee:', error);
      setError('Failed to save coffee');
      return false;
    }
  }, [userId]);

  /**
   * Removes a coffee from the user's saved list
   * 
   * @param coffeeId - ID of the coffee to remove
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  const unsaveCoffee = useCallback(async (coffeeId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Find the save ID for this coffee
      const response = await fetch(`/api/saved-coffees?userId=${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const savedCoffee = result.data.find((saved: any) => saved.coffeeId === coffeeId);
          if (savedCoffee) {
            const deleteResponse = await fetch(`/api/saved-coffees?id=${savedCoffee.id}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              setSavedCoffees(prev => prev.filter(id => id !== coffeeId));
              return true;
            } else {
              setError('Failed to remove coffee from saved list');
              return false;
            }
          }
        }
      }
      
      setError('Failed to find saved coffee');
      return false;
    } catch (error) {
      console.error('Error removing saved coffee:', error);
      setError('Failed to remove saved coffee');
      return false;
    }
  }, [userId]);

  /**
   * Toggles the saved state of a coffee
   * 
   * @param coffeeId - ID of the coffee to toggle
   * @param coffeeData - Coffee information (required for saving)
   * @returns Promise<boolean> - true if successful, false otherwise
   */
  const toggleSavedCoffee = useCallback(async (coffeeId: string, coffeeData: any): Promise<boolean> => {
    const isCurrentlySaved = savedCoffees.includes(coffeeId);
    
    if (isCurrentlySaved) {
      return await unsaveCoffee(coffeeId);
    } else {
      return await saveCoffee(coffeeId, coffeeData);
    }
  }, [savedCoffees, saveCoffee, unsaveCoffee]);

  /**
   * Checks if a specific coffee is saved
   * 
   * @param coffeeId - ID of the coffee to check
   * @returns boolean - true if saved, false otherwise
   */
  const isCoffeeSaved = useCallback((coffeeId: string): boolean => {
    return savedCoffees.includes(coffeeId);
  }, [savedCoffees]);

  /**
   * Clears any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load saved coffees when userId changes
  useEffect(() => {
    if (userId) {
      fetchSavedCoffees();
    } else {
      setSavedCoffees([]);
    }
  }, [userId, fetchSavedCoffees]);

  return {
    savedCoffees,
    loading,
    error,
    saveCoffee,
    unsaveCoffee,
    toggleSavedCoffee,
    isCoffeeSaved,
    fetchSavedCoffees,
    clearError
  };
};
