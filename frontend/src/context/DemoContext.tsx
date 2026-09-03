import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface DemoScenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  targetRoute: string;
  payload: any;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'kyc-scam',
    title: 'Scenario 1: KYC Phishing (Hindi/Kannada/English)',
    badge: 'NLP Scam AI',
    description: 'Fake bank closure SMS threatening account suspension within 24h & demanding Re.1 fee.',
    targetRoute: '/analyze-message',
    payload: {
      message: 'प्रिय ग्राहक, आपका SBI Yono खाता आज बंद कर दिया जाएगा क्योंकि आपकी KYC अधूरी है। तुरंत http://sbi-kyc-verification.top/update पर जाएं या खाता चालू रखने के लिए sbi.helpline.nodal@ybl पर ₹10 सत्यापन शुल्क भेजें।',
      language_hint: 'hi'
    }
  },
  {
    id: 'fake-refund',
    title: 'Scenario 2: Fake ₹4,850 Cashback / Refund',
    badge: 'Social Engineering',
    description: 'Order refund lure attempting to trick user into entering UPI PIN to receive money.',
    targetRoute: '/analyze-message',
    payload: {
      message: 'Congratulations! Your refund of Rs.4,850 for failed transaction is approved. To receive money directly into your bank account, click http://free-cashback-gpay.online/claim and enter your 6-digit UPI PIN.',
      language_hint: 'en'
    }
  },
  {
    id: 'suspicious-qr',
    title: 'Scenario 3: Manipulated Payment QR Code',
    badge: 'QR Analysis',
    description: 'Malicious merchant QR pointing to a blacklisted mule UPI ID with debit payload.',
    targetRoute: '/scan-qr',
    payload: {
      qr_data: 'upi://pay?pa=sbi.helpline.nodal@ybl&pn=SBI+Nodal+Desk&am=10.00&cu=INR&tn=KYC+Verification+Fee'
    }
  },
  {
    id: 'txn-anomaly',
    title: 'Scenario 4: Nocturnal ₹45,000 Transaction Anomaly',
    badge: 'Isolation Forest ML',
    description: '₹45,000 transfer attempted at 03:15 AM to an unverified recipient from an unknown device.',
    targetRoute: '/transaction-analysis',
    payload: {
      amount: 45000,
      time_str: '03:15',
      hour: 3,
      recipient_upi: 'rajesh123@upi',
      is_new_recipient: true,
      location: 'Kolkata, IN',
      device_id: 'Unknown_Device_X9',
      device_changed: true,
      transaction_frequency_today: 8
    }
  },
  {
    id: 'fraud-network',
    title: 'Scenario 5: Connected Mule Syndicate Network',
    badge: 'NetworkX Graph',
    description: 'Visualize multi-layer money mule cluster with high-degree laundering accounts.',
    targetRoute: '/fraud-network',
    payload: {
      focusNode: 'UPI_SCAM_1'
    }
  }
];

interface DemoContextType {
  isDemoActive: boolean;
  activeScenario: DemoScenario | null;
  activateScenario: (scenarioId: string) => void;
  clearDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);
  const navigate = useNavigate();

  const activateScenario = (scenarioId: string) => {
    const found = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (found) {
      setActiveScenario(found);
      navigate(found.targetRoute, { state: { demoPayload: found.payload } });
    }
  };

  const clearDemo = () => {
    setActiveScenario(null);
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoActive: !!activeScenario,
        activeScenario,
        activateScenario,
        clearDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within a DemoProvider');
  return context;
};
