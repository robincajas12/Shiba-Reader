import { useEffect, useCallback, useState } from 'react';
import * as RNIap from 'react-native-iap';

const productID = 'remove_ads';

export const useBilling = (
    isAdFree: boolean,
    setIsAdFree: (val: boolean) => void,
) => {
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const setupIap = async () => {
            try {
                await RNIap.initConnection();

                if (!isAdFree) {
                    const purchases = await RNIap.getAvailablePurchases();

                    const owned = purchases.some(
                        (p) => p.productId === productID,
                    );

                    if (owned) {
                        setIsAdFree(true);
                    }
                }

                purchaseUpdateSubscription =
                    RNIap.purchaseUpdatedListener(
                        async (purchase) => {
                            try {
                                await RNIap.finishTransaction({
                                    purchase,
                                    isConsumable: false,
                                });

                                setIsAdFree(true);
                            } catch (err) {
                                console.error(
                                    'Error finalizando transacción:',
                                    err,
                                );
                            } finally {
                                setIsPurchasing(false);
                            }
                        },
                    );

                purchaseErrorSubscription =
                    RNIap.purchaseErrorListener((error) => {
                        console.warn(
                            'Error en listener de compra:',
                            error,
                        );
                        setIsPurchasing(false);
                    });
            } catch (err) {
                console.warn(
                    'Error al inicializar pagos:',
                    err,
                );
            }
        };

        setupIap();

        return () => {
            purchaseUpdateSubscription?.remove();
            purchaseErrorSubscription?.remove();
            RNIap.endConnection();
        };
    }, [setIsAdFree, isAdFree]);

    const buyRemoveAds = useCallback(async () => {
        setIsPurchasing(true);

        try {
            await RNIap.requestPurchase({
                request: {
                    google: {
                        skus: [productID],
                    },
                },
                type: 'in-app',
            });
        } catch (err) {
            console.warn(
                'Error al solicitar compra:',
                err,
            );
            setIsPurchasing(false);
        }
    }, []);

    const restorePurchases = useCallback(
        async (): Promise<boolean> => {
            try {
                const purchases =
                    await RNIap.getAvailablePurchases();

                const owned = purchases.some(
                    (p) => p.productId === productID,
                );

                if (owned) {
                    setIsAdFree(true);
                    return true;
                }

                return false;
            } catch (err) {
                console.warn(
                    'Error al restaurar compras:',
                    err,
                );
                return false;
            }
        },
        [setIsAdFree],
    );

    return {
        buyRemoveAds,
        restorePurchases,
        isPurchasing,
    };
};