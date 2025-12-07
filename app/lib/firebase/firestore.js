import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

export const createDocument = async (collectionName, docId, data) => {
    try {
        console.log(`[createDocument] Starting write to ${collectionName}/${docId}`, data);
        await setDoc(doc(db, collectionName, docId), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log(`[createDocument] Write success to ${collectionName}/${docId}`);
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getDocument = async (collectionName, docId) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
        } else {
            return { data: null, error: 'Document not found' };
        }
    } catch (error) {
        return { data: null, error: error.message };
    }
};

export const updateDocument = async (collectionName, docId, data) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteDocument = async (collectionName, docId) => {
    try {
        await deleteDoc(doc(db, collectionName, docId));
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const queryDocuments = async (collectionName, conditions = [], orderByField = null, limitCount = null) => {
    try {
        let q = collection(db, collectionName);

        const constraints = [];
        conditions.forEach(condition => {
            constraints.push(where(condition.field, condition.operator, condition.value));
        });

        if (orderByField) {
            constraints.push(orderBy(orderByField));
        }

        if (limitCount) {
            constraints.push(limit(limitCount));
        }

        if (constraints.length > 0) {
            q = query(q, ...constraints);
        }

        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });

        return { data: documents, error: null };
    } catch (error) {
        return { data: [], error: error.message };
    }
};

export const subscribeToDocument = (collectionName, docId, callback) => {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            callback(null);
        }
    });
};

export const subscribeToCollection = (collectionName, conditions = [], callback) => {
    let q = collection(db, collectionName);

    if (conditions.length > 0) {
        const constraints = conditions.map(condition =>
            where(condition.field, condition.operator, condition.value)
        );
        q = query(q, ...constraints);
    }

    return onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
    });
};

export const incrementField = (fieldName, value = 1) => {
    return increment(value);
};

export { db, serverTimestamp };
