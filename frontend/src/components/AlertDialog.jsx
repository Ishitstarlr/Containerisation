import { useEffect, useRef, useState } from 'react';

const AlertDialog = ({
  onPending,  
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const dialogRef = useRef(null);

  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen) {
      // Trap focus when dialog opens
      dialogRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        <style>
          {`
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            
            .alert-button {
              padding: 8px 16px;
              border-radius: 4px;
              border: none;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.2s;
            }
            
            .confirm-button {
              background-color: #dc3545;
              color: white;
              margin-left: 8px;
            }
            
            .confirm-button:hover {
              background-color: #c82333;
            }
            
            .cancel-button {
              background-color: #e9ecef;
              color: #212529;
            }
            
            .cancel-button:hover {
              background-color: #dde2e6;
            }
          `}
        </style>
        
        <h2 
          id="alert-title"
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600'
          }}
        >
          {title}
        </h2>
        
        <p 
          id="alert-message"
          style={{
            margin: '0 0 20px 0',
            color: '#666',
            fontSize: '14px'
          }}
        >
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button 
            onClick={onClose}
            className="alert-button cancel-button"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="alert-button confirm-button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;