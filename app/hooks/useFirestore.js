'use client';

import { useState, useCallback } from 'react';
import {
    getDocument,
    queryDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    subscribeToDocument,
    subscribeToCollection
} from '../lib/firebase/firestore';

export const useFirestore = (collectionName) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const get = useCallback(async (docId) => {
        setLoading(true);
        setError(null);
        const result = await getDocument(collectionName, docId);
        setData(result.data);
        setError(result.error);
        setLoading(false);
        return result;
    }, [collectionName]);

    const query = useCallback(async (conditions = [], orderByField = null, limitCount = null) => {
        setLoading(true);
        setError(null);
        const result = await queryDocuments(collectionName, conditions, orderByField, limitCount);
        setData(result.data);
        setError(result.error);
        setLoading(false);
        return result;
    }, [collectionName]);

    const create = useCallback(async (docId, docData) => {
        setLoading(true);
        setError(null);
        const result = await createDocument(collectionName, docId, docData);
        setError(result.error);
        setLoading(false);
        return result;
    }, [collectionName]);

    const update = useCallback(async (docId, docData) => {
        setLoading(true);
        setError(null);
        const result = await updateDocument(collectionName, docId, docData);
        setError(result.error);
        setLoading(false);
        return result;
    }, [collectionName]);

    const remove = useCallback(async (docId) => {
        setLoading(true);
        setError(null);
        const result = await deleteDocument(collectionName, docId);
        setError(result.error);
        setLoading(false);
        return result;
    }, [collectionName]);

    const subscribe = useCallback((docId, callback) => {
        return subscribeToDocument(collectionName, docId, callback);
    }, [collectionName]);

    const subscribeQuery = useCallback((conditions, callback) => {
        return subscribeToCollection(collectionName, conditions, callback);
    }, [collectionName]);

    return {
        data,
        loading,
        error,
        get,
        query,
        create,
        update,
        remove,
        subscribe,
        subscribeQuery
    };
};
