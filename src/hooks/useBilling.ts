import {useCallback, useEffect, useMemo, useState} from 'react';
import * as RNIap from 'react-native-iap';
import type {Purchase, PurchaseError} from 'react-native-iap';

const productID = 'remove_ads';

type BillingNotice = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const isRemoveAdsPurchase = (purchase: Purchase) => {
  const matchesProduct =
    purchase.productId === productID || purchase.ids?.includes(productID);

  return (
    matchesProduct &&
    purchase.purchaseState === 'purchased' &&
    Boolean(purchase.purchaseToken || purchase.transactionId)
  );
};

export const useBilling = (
  isAdFree: boolean,
  setIsAdFree: (val: boolean) => void,
) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState<string | null>(null);
  const [notice, setNotice] = useState<BillingNotice | null>(null);

  const clearNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const handlePurchaseSuccess = useCallback(
    async (purchase: Purchase) => {
      if (!isRemoveAdsPurchase(purchase)) {
        setIsPurchasing(false);

        if (purchase.purchaseState === 'pending') {
          setNotice({
            type: 'info',
            message:
              'Your purchase is pending. Pro will unlock once the store confirms the payment.',
          });
        }

        return;
      }

      try {
        await RNIap.finishTransaction({
          purchase,
          isConsumable: false,
        });

        setIsAdFree(true);
        setNotice({
          type: 'success',
          message: 'Pro unlocked. Thanks for supporting Shiba Reader.',
        });
      } catch {
        setNotice({
          type: 'error',
          message:
            'The purchase was approved, but we could not finish it. Please try restoring purchases.',
        });
      } finally {
        setIsPurchasing(false);
      }
    },
    [setIsAdFree],
  );

  const handlePurchaseError = useCallback((error: PurchaseError) => {
    setIsPurchasing(false);

    setNotice({
      type: error.code === RNIap.ErrorCode.UserCancelled ? 'info' : 'error',
      message:
        error.code === RNIap.ErrorCode.UserCancelled
          ? 'Purchase cancelled.'
          : error.message || 'The store could not process the purchase.',
    });
  }, []);

  const iapOptions = useMemo(
    () => ({
      onPurchaseSuccess: handlePurchaseSuccess,
      onPurchaseError: handlePurchaseError,
      onError: () => {
        setNotice({
          type: 'error',
          message: 'The store is not available right now. Please try again later.',
        });
      },
    }),
    [handlePurchaseError, handlePurchaseSuccess],
  );

  const {connected, products, fetchProducts, requestPurchase} =
    RNIap.useIAP(iapOptions);

  useEffect(() => {
    if (!connected) {
      return;
    }

    fetchProducts({
      skus: [productID],
      type: 'in-app',
    });
  }, [connected, fetchProducts]);

  useEffect(() => {
    const product = products.find((item) => item.id === productID);

    if (product) {
      setLocalizedPrice(product.displayPrice);
    }
  }, [products]);

  useEffect(() => {
    if (!connected || isAdFree) {
      return;
    }

    const checkOwnedPurchase = async () => {
      try {
        const purchases = await RNIap.getAvailablePurchases();

        if (purchases.some(isRemoveAdsPurchase)) {
          setIsAdFree(true);
        }
      } catch {
        setNotice({
          type: 'error',
          message: 'We could not check your purchases right now.',
        });
      }
    };

    checkOwnedPurchase();
  }, [connected, isAdFree, setIsAdFree]);

  const buyRemoveAds = useCallback(async () => {
    setIsPurchasing(true);
    setNotice(null);

    try {
      await requestPurchase({
        request: {
          apple: {
            sku: productID,
          },
          google: {
            skus: [productID],
          },
        },
        type: 'in-app',
      });
    } catch {
      setNotice({
        type: 'error',
        message: 'Could not open the store purchase sheet. Please try again.',
      });
      setIsPurchasing(false);
    }
  }, [requestPurchase]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);
    setNotice(null);

    try {
      const purchases = await RNIap.getAvailablePurchases();
      const owned = purchases.some(isRemoveAdsPurchase);

      if (owned) {
        setIsAdFree(true);
        setNotice({
          type: 'success',
          message: 'Purchase restored. Pro is active on this device.',
        });
        return true;
      }

      setNotice({
        type: 'info',
        message: 'No previous Pro purchase was found for this store account.',
      });
      return false;
    } catch {
      setNotice({
        type: 'error',
        message: 'Could not restore purchases. Please try again later.',
      });
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [setIsAdFree]);

  return {
    buyRemoveAds,
    restorePurchases,
    clearNotice,
    isPurchasing,
    isRestoring,
    localizedPrice,
    notice,
  };
};
