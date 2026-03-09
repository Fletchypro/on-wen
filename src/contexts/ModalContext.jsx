import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [showVerifyPhoneModal, setShowVerifyPhoneModal] = useState(false);
  const [phoneForVerification, setPhoneForVerification] = useState('');

  const openPhoneVerificationModal = (phone) => {
    setPhoneForVerification(phone);
    setShowVerifyPhoneModal(true);
  };

  const closePhoneVerificationModal = () => {
    setShowVerifyPhoneModal(false);
    setPhoneForVerification('');
  };

  const value = {
    showVerifyPhoneModal,
    phoneForVerification,
    openPhoneVerificationModal,
    closePhoneVerificationModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};