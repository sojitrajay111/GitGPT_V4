'use client';
import React from 'react';
import GptmodelDetail from '@/components/GptmodelDetail';
import PmtmodelDetail from '@/components/PmtmodelDetail';
import GitHubData from '@/components/GitHubData';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

const Configuration = () => {
       const { userId } = useParams();
      
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6">
            <div className="max-w-6xl mx-auto">
                <GptmodelDetail />
                <PmtmodelDetail />
                <GitHubData userId={userId} />
            </div>
        </div>
    );
};

export default Configuration;
