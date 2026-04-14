import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { NavigationProvider, useNavigation } from './components/NavigationProvider';
import OrdersScreen from './screens/OrdersScreen';
import ColdChainScreen from './screens/ColdChainScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import CustomersScreen from './screens/CustomersScreen';
import SuppliersScreen from './screens/SuppliersScreen';
import ShipmentsScreen from './screens/ShipmentsScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import { TransitionType } from './types';

import AppShell from './components/AppShell';

function AppContent() {
  const { currentScreen, transition } = useNavigation();

  const getVariants = (type: TransitionType) => {
    switch (type) {
      case 'push':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 },
        };
      case 'push_back':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '100%', opacity: 0 },
        };
      case 'slide_up':
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '-100%', opacity: 0 },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants(transition);

  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentScreen}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full min-h-screen"
        >
          {currentScreen === 'orders' && <OrdersScreen />}
          {currentScreen === 'inventory' && <ColdChainScreen />}
          {currentScreen === 'receipt' && <ReceiptScreen />}
          {currentScreen === 'customers' && <CustomersScreen />}
          {currentScreen === 'suppliers' && <SuppliersScreen />}
          {currentScreen === 'shipments' && <ShipmentsScreen />}
          {currentScreen === 'payments' && <PaymentsScreen />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}
