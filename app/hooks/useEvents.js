'use client';

import { useEventContext } from '../context/EventContext';

export const useEvents = () => {
    return useEventContext();
};
