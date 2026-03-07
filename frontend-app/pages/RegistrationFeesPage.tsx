import React, { useState, useEffect } from 'react';
// import { Course } from '../data/courses';
import { Revision } from '../data/revisions';

interface Enrollment {
  id: string;
  itemId: string;
  itemType: 'course' | 'revision';
  status: 'Pending Payment' | 'Pending Confirmation' | 'Active' | 'Cancelled';
  userId: string;
  registrationFeeStatus: 'Paid' | 'Unpaid';
}

const RegistrationFeesPage: React.FC = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [allRevisions, setAllRevisions] = useState<Revision[]>([]);
    const REGISTRATION_FEE = 250;

    useEffect(() => {
        const storedEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userEnrollments = storedEnrollments.filter(e => e.userId === user.email);
        setEnrollments(userEnrollments);

        setAllCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
        setAllRevisions(JSON.parse(localStorage.getItem('revisions') || '[]'));
    }, []);
    
    const getItemDetails = (itemId: string, itemType: 'course' | 'revision'): any | Revision | undefined => {
        return itemType === 'course' 
            ? allCourses.find(c => c.id === itemId) 
            : allRevisions.find(r => r.id === itemId);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 text-center">Registration Fees</h1>
            <p className="text-center text-slate-600 mb-8">A one-time fee of {REGISTRATION_FEE} DH is required for each new enrollment.</p>

            {enrollments.length > 0 ? (
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                    <div className="space-y-4">
                        {enrollments.map(enrollment => {
                            const item = getItemDetails(enrollment.itemId, enrollment.itemType);
                            if (!item) return null;

                            return (
                                <div key={enrollment.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div>
                                            <h2 className="font-bold text-slate-800">{item.title}</h2>
                                            <p className="text-sm text-slate-500">Status: {enrollment.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-slate-700">{REGISTRATION_FEE} DH</p>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            enrollment.registrationFeeStatus === 'Paid' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {enrollment.registrationFeeStatus}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <p className="text-center text-slate-500 mt-8">You have no enrollments yet.</p>
            )}
        </div>
    );
};

export default RegistrationFeesPage;