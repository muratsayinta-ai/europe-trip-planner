import { createContext, useContext } from 'react'

// Lets any page switch the active tab (e.g. jump between Places and Plan).
export const NavContext = createContext(() => {})
export const useNav = () => useContext(NavContext)
