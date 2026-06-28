import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.body.classList.add('modal-open')
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl animate-fade-up flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + título — fijos arriba */}
        <div className="px-6 pt-4 pb-3 flex-shrink-0">
          <div className="w-10 h-1 bg-flux-border rounded-full mx-auto mb-4" />
          {title && <h2 className="text-lg font-bold">{title}</h2>}
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
