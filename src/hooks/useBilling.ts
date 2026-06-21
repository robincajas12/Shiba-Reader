import { useEffect, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as RNIap from 'react-native-iap';

const productID = 'remove_ads';

export const useBilling = (
    isAdFree: boolean,
    setIsAdFree: (val: boolean) => void,
) => {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [localizedPrice, setLocalizedPrice] = useState<string | null>(null);

    useEffect(() => {
        let purchaseUpdateSubscription: any;
        let purchaseErrorSubscription: any;

        const setupIap = async () => {
            try {
                await RNIap.initConnection();

                try {
                    const products = await RNIap.fetchProducts({ skus: [productID] });
                    if (products && products.length > 0) {
                        Alert.alert(products[0].title);
                        setLocalizedPrice(products[0].displayPrice + ' ' + products[0].currency);
                    }
                } catch (prodErr) {
                    console.warn('Error al obtener los detalles del producto:', prodErr);
                }

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
                                Alert.alert('Éxito', '¡Gracias por tu compra! Anuncios removidos.');
                            } catch (err: any) {
                                console.error( 
                                    err,
                                );
                                Alert.alert('Error', `Error al completar la transacción: ${err?.message || err}`);
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
                        Alert.alert('Compra cancelada/error', error?.message || 'Hubo un problema al procesar la compra.');
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
        } catch (err: any) {
            console.warn(
                'Error al solicitar compra:',
                err,
            );
            Alert.alert(
                'Error de Compra',
                `No se pudo iniciar la compra. Detalles: ${err?.message || err}`
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
        localizedPrice,
        
    };
};