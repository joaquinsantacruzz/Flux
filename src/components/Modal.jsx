import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl p-6 animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-flux-border rounded-full mx-auto mb-5" />
        {title && <h2 className="text-lg font-bold mb-5">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
