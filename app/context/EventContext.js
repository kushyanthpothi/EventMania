'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { queryDocuments, createDocument, updateDocument, deleteDocument } from '../lib/firebase/firestore';
import { COLLECTIONS } from '../lib/utils/constants';

const EventContext = createContext({});

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEvents = useCallback(async (filters = []) => {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await queryDocuments(COLLECTIONS.EVENTS, filters);
        if (fetchError) {
            setError(fetchError);
        } else {
            setEvents(data);
        }
        setLoading(false);
    }, []);

    const createEvent = useCallback(async (eventData, eventId) => {
        const { success, error: createError } = await createDocument(COLLECTIONS.EVENTS, eventId, eventData);
        if (createError) {
            setError(createError);
            return { success: false, error: createError };
        }
        return { success: true, error: null };
    }, []);

    const updateEvent = useCallback(async (eventId, eventData) => {
        const { success, error: updateError } = await updateDocument(COLLECTIONS.EVENTS, eventId, eventData);
        if (updateError) {
            setError(updateError);
            return { success: false, error: updateError };
        }
        return { success: true, error: null };
    }, []);

    const deleteEvent = useCallback(async (eventId) => {
        const { success, error: deleteError } = await deleteDocument(COLLECTIONS.EVENTS, eventId);
        if (deleteError) {
            setError(deleteError);
            return { success: false, error: deleteError };
        }
        return { success: true, error: null };
    }, []);

    const value = {
        events,
        loading,
        error,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent
    };

    return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEventContext must be used within an EventProvider');
    }
    return context;
};
