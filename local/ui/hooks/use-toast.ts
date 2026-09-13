import { useState, useEffect } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = Toast & {
  id: string
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const listeners: Array<(toasts: ToasterToast[]) => void> = []
let memoryState: ToasterToast[] = []

function dispatch(toast: ToasterToast) {
  memoryState = [toast, ...memoryState].slice(0, TOAST_LIMIT)
  listeners.forEach((listener) => listener(memoryState))
}

function toast({ ...props }: Omit<Toast, 'id'>) {
  const id = genId()

  const update = (props: ToasterToast) => dispatch({ ...props, id })

  const dismiss = () => {
    const timeoutId = toastTimeouts.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      toastTimeouts.delete(id)
    }
    memoryState = memoryState.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(memoryState))
  }

  dispatch({ ...props, id })

  const timeoutId = setTimeout(() => {
    dismiss()
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(id, timeoutId)

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = useState<ToasterToast[]>(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts: state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        const timeoutId = toastTimeouts.get(toastId)
        if (timeoutId) {
          clearTimeout(timeoutId)
          toastTimeouts.delete(toastId)
        }
        memoryState = memoryState.filter((t) => t.id !== toastId)
        listeners.forEach((listener) => listener(memoryState))
      }
    },
  }
}

export { useToast, toast }
