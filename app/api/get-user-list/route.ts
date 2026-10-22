import { useState, useEffect } from 'react';
import pb from '@/functions/client';


export default async function getUsers() {
    try {
        // fetch a paginated records list
        const records = await pb.collection('profile').getFullList({
            sort: 'full_name',
            $autoCancel: false, // Disable auto-cancellation of requests
        });
        return Promise.resolve(records); // Return the list of user records

    } catch (error) {
        console.error('Error fetching data:', error);
        return Promise.reject(error);
    }
}