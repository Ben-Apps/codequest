'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseKeyboardOptions {
  onInteract?: () => void
  onAttack?: () => void
  onEscape?: () => void
  disabled?: boolean
}

export function useKeyboard(options: UseKeyboardOptions = {}) {
  const { onInteract, onAttack, onEscape, disabled } = options
  const keysPressed = useRef<Set<string>>(new Set())

  // Check if user is typing in an input field
  const isTyping = useCallback(() => {
    const active = document.activeElement
    return (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active?.getAttribute('contenteditable') === 'true'
    )
  }, [])

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping()) return

      const key = e.key.toLowerCase()
      
      // Movement keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        keysPressed.current.add(key)
      }

      // Interact key
      if (key === 'e' || key === ' ') {
        e.preventDefault()
        onInteract?.()
      }

      // Attack key
      if (key === 'f') {
        e.preventDefault()
        onAttack?.()
      }

      // Escape key
      if (key === 'escape') {
        e.preventDefault()
        onEscape?.()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysPressed.current.delete(key)
    }

    // Clear keys when window loses focus
    const handleBlur = () => {
      keysPressed.current.clear()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [disabled, isTyping, onInteract, onAttack, onEscape])

  return keysPressed
}
