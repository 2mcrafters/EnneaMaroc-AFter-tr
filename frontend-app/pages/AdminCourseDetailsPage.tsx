import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { useReduxDataReadOnly } from '../hooks/useReduxData';
import { useAppDispatch, useAppSelector } from '../store';
import { createBulkEnrollments } from '../store/enrollmentsSlice';
import { selectInstructors } from '../store/slices/userSlice';
import { showSuccess, showError } from '../store/slices/uiSlice';

const AdminCourseDetailsPage: React.FC = () => {
  const { coursesState, enrollmentsState, usersState } = useReduxDataReadOnly();
  const dispatch = useAppDispatch();
  const instructors = useAppSelector(selectInstructors);
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());
  const [addingStudents, setAddingStudents] = useState<Set<number>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<{ [groupId: number]: number[] }>({});
  const [searchTerms, setSearchTerms] = useState<{ [groupId: number]: string }>({});
  const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());

  // Get course id from hash: expected format #/admin/courses/details/:id
  const hash = window.location.hash || '';
  const parts = hash.split('/');
  const idPart = parts[parts.length - 1];
  const courseId = Number(idPart);

  const course = useMemo(() => coursesState.find((c: any) => c.id === courseId), [coursesState, courseId]);

  // Map enrollments by group (matching by group day/time or id if available)
  const enrollmentsForCourse = useMemo(() => 
    enrollmentsState.filter((en: any) => en.course_id === courseId),
    [enrollmentsState, courseId]
  );

  // Debug: Log enrollments structure
  console.log('Course enrollments:', {
    courseId,
    enrollmentsForCourse,
    sampleEnrollment: enrollmentsForCourse[0]
  });

  const usersById = useMemo(() => {
    const map = new Map<number, any>();
    usersState.forEach((u: any) => map.set(u.id, u));
    return map;
  }, [usersState]);

  // Create instructor lookup by ID
  const instructorsById = useMemo(() => {
    const map = new Map<string, any>();
    instructors.forEach((instructor: any) => map.set(instructor.id, instructor));
    return map;
  }, [instructors]);

  // Get all students not yet enrolled in this course
  const availableStudents = useMemo(() => {
    const enrolledUserIds = new Set(enrollmentsForCourse.map((en: any) => en.user_id));
    return usersState.filter((u: any) => u.role === 'student' && !enrolledUserIds.has(u.id));
  }, [usersState, enrollmentsForCourse]);

  useEffect(() => {
    // no-op: page relies on preloaded redux data
  }, []);

  if (!course) {
    return (
      <AdminLayout>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Module non trouvé</h2>
          <p className="text-sm text-slate-500">Le module demandé n'a pas pu être localisé dans les données actuelles.</p>
        </div>
      </AdminLayout>
    );
  }

  const toggleGroup = (groupId: number) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  const toggleAddStudents = (groupId: number) => {
    const newAddingStudents = new Set(addingStudents);
    if (newAddingStudents.has(groupId)) {
      newAddingStudents.delete(groupId);
      setSelectedStudents(prev => ({ ...prev, [groupId]: [] }));
      setSearchTerms(prev => ({ ...prev, [groupId]: '' }));
    } else {
      newAddingStudents.add(groupId);
    }
    setAddingStudents(newAddingStudents);
  };

  const handleStudentSelection = (groupId: number, studentId: number) => {
    setSelectedStudents(prev => {
      const currentSelection = prev[groupId] || [];
      const isSelected = currentSelection.includes(studentId);
      
      if (isSelected) {
        return {
          ...prev,
          [groupId]: currentSelection.filter(id => id !== studentId)
        };
      } else {
        return {
          ...prev,
          [groupId]: [...currentSelection, studentId]
        };
      }
    });
  };

  const addSelectedStudents = async (groupId: number) => {
    const studentsToAdd = selectedStudents[groupId] || [];
    if (studentsToAdd.length === 0) return;

    // Set loading state
    setLoadingGroups(prev => new Set(prev).add(groupId));

    try {
      // For courses, we use the group index + 1 as the actual group_id
      const actualGroupId = groupId + 1;
      
      // Create enrollment data for each selected student
      const enrollmentsData = studentsToAdd.map(studentId => ({
        user_id: studentId,
        course_id: courseId,
        group_id: actualGroupId,
        status: 'pending_payment' as const
      }));

      console.log('Creating course enrollments with data:', {
        groupId,
        actualGroupId,
        enrollmentsData
      });

      // Send bulk enrollment request via Redux
      const result = await dispatch(createBulkEnrollments(enrollmentsData));
      
      // Check if the action was fulfilled
      if (createBulkEnrollments.fulfilled.match(result)) {
        // Reset selection and close add mode
        setSelectedStudents(prev => ({ ...prev, [groupId]: [] }));
        setSearchTerms(prev => ({ ...prev, [groupId]: '' }));
        toggleAddStudents(groupId);
        
        dispatch(showSuccess({ title: 'Succès', message: 'Étudiants ajoutés avec succès' }));
        // No need to reload - Redux state is already updated!
      } else {
        // Handle error
        throw new Error('Failed to create enrollments');
      }
      
    } catch (error) {
      console.error('Error adding students:', error);
      dispatch(showError({ title: 'Erreur', message: `Erreur lors de l'ajout des étudiants: ${error instanceof Error ? error.message : 'Erreur inconnue'}` }));
    } finally {
      // Remove loading state
      setLoadingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleSearchChange = (groupId: number, searchTerm: string) => {
    setSearchTerms(prev => ({ ...prev, [groupId]: searchTerm }));
  };

  const getFilteredStudents = (groupId: number) => {
    const searchTerm = searchTerms[groupId] || '';
    if (!searchTerm.trim()) {
      return availableStudents;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return availableStudents.filter((student: any) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email.toLowerCase();
      return fullName.includes(lowercaseSearch) || email.includes(lowercaseSearch);
    });
  };

  return (
    <AdminLayout>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <button 
            onClick={() => { window.location.hash = '#/admin/courses'; }} 
            className="text-sm text-slate-600 underline hover:text-slate-800 cursor-pointer"
          >
            Retour aux modules
          </button>
        </div>

        <div className="space-y-6">
          {course.groups?.map((group: any, idx: number) => {
            // Find enrollments that match this group
            // Using group index + 1 as group_id (since we use idx+1 when creating enrollments)
            const expectedGroupId = idx + 1;
            const matchedEnrollments = enrollmentsForCourse.filter((en: any) => {
              // First try to match by group_id
              if (en.group_id === expectedGroupId) return true;
              
              // Fallback: try to match by group time and day if enrollment stores group info
              if (en.group && typeof en.group === 'object') {
                try {
                  if (en.group.time && en.group.time === group.time && en.group.day === group.day) return true;
                } catch (e) {
                  // ignore
                }
              }
              
              // Additional fallback: check if group_id matches the index pattern
              if (en.group_id && Number(en.group_id) === expectedGroupId) return true;
              
              return false;
            });

            const groupId = idx; // Using index as group ID for accordion state
            const isOpen = openGroups.has(groupId);
            const isAddingStudents = addingStudents.has(groupId);
            const selectedStudentsForGroup = selectedStudents[groupId] || [];
            
            // Get instructor name - handle both instructor object and instructor_id formats
            let instructor = null;
            let instructorId = null;
            
            // Check if group has instructor object or instructor_id
            if (group.instructor && group.instructor.id) {
              instructorId = group.instructor.id;
              instructor = group.instructor;
            } else if (group.instructor_id) {
              instructorId = group.instructor_id;
            } else if (group.instructorId) {
              instructorId = group.instructorId;
            }
            
            // If we don't have instructor object, find it in instructors list
            if (!instructor && instructorId) {
              instructor = instructors.find((inst: any) => String(inst.id) === String(instructorId));
            }
            
            const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'N/A';

            console.log(`Group ${idx} (${group.day} ${group.time}):`, {
              expectedGroupId,
              matchedEnrollments,
              totalEnrollments: enrollmentsForCourse.length,
              groupStructure: group,
              instructorId,
              instructor,
              instructorName
            });

            return (
              <div key={idx} className="group-accordion border border-slate-200 rounded-lg overflow-hidden">
                <div 
                  className="group-header p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 flex justify-between items-center"
                  onClick={() => toggleGroup(groupId)}
                >
                  <div className="flex items-center">
                    <span className="accordion-icon text-slate-600 mr-2">
                      {isOpen ? '▼' : '▶'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {group.title ? (
                          <>
                            {group.title}
                            <span className="text-slate-500 font-normal"> — {group.day} {group.time ? `— ${group.time}` : ''}</span>
                          </>
                        ) : (
                          <>Session : {group.day} — {group.time}</>
                        )}
                      </h3>
                      {group.subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">{group.subtitle}</p>
                      )}
                      <p className="text-sm text-slate-500">Instructeur : {instructorName}</p>
                    </div>
                  </div>
                  <span className="group-count text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {matchedEnrollments.length} étudiants
                  </span>
                </div>
                
                {isOpen && (
                  <div className="group-content p-4 bg-white border-t border-slate-200">
                    {/* Inline edit Title/Subtitle */}
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Titre</label>
        <input
                          type="text"
                          defaultValue={group.title || ''}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if ((group.title || '') !== val && group.id) {
                              // dispatch(updateCourseGroupAsync({ groupId: group.id, data: { title: val || undefined } }) as any);
                              console.log('Update group title not implemented for Parcours yet');
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark"
                          placeholder="Titre de la session"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Sous-titre</label>
        <input
                          type="text"
                          defaultValue={group.subtitle || ''}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if ((group.subtitle || '') !== val && group.id) {
                              // dispatch(updateCourseGroupAsync({ groupId: group.id, data: { subtitle: val || undefined } }) as any);
                              console.log('Update group subtitle not implemented for Parcours yet');
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark"
                          placeholder="Sous-titre de la session"
                        />
                      </div>
                    </div>
                    <div className="group-actions mb-4 flex gap-2">
                      <button 
                        className={`px-4 py-2 rounded text-sm transition-colors ${
                          isAddingStudents 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAddStudents(groupId);
                        }}
                      >
                        {isAddingStudents ? 'Annuler' : 'Ajouter des étudiants'}
                      </button>
                      
                      {isAddingStudents && selectedStudentsForGroup.length > 0 && (
                        <button 
                          className={`px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm transition-colors flex items-center gap-1 ${
                            loadingGroups.has(groupId) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => addSelectedStudents(groupId)}
                          disabled={loadingGroups.has(groupId)}
                        >
                          {loadingGroups.has(groupId) && (
                            <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          Ajouter {selectedStudentsForGroup.length} étudiant{selectedStudentsForGroup.length > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>

                    {isAddingStudents && (
                      <div className="add-students-section mb-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Sélectionner les Étudiants à Ajouter :</h4>
                        
                        {availableStudents.length === 0 ? (
                          <p className="text-sm text-slate-500">Aucun étudiant disponible à ajouter.</p>
                        ) : (
                          <>
                            <div className="search-box mb-3">
                              <input
                                type="text"
                                placeholder="Rechercher un étudiant..."
                                value={searchTerms[groupId] || ''}
                                onChange={(e) => handleSearchChange(groupId, e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="students-grid space-y-2 max-h-48 overflow-y-auto">
                              {getFilteredStudents(groupId).map((student: any) => (
                                <label key={student.id} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-100 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentsForGroup.includes(student.id)}
                                    onChange={() => handleStudentSelection(groupId, student.id)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">
                                    {student.firstName} {student.lastName} ({student.email})
                                  </span>
                                </label>
                              ))}
                            </div>
                            
                            {getFilteredStudents(groupId).length === 0 && (searchTerms[groupId] || '').trim() && (
                              <p className="text-sm text-slate-500 mt-2">Aucun étudiant trouvé pour "{searchTerms[groupId]}"</p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <div className="enrolled-students">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Étudiants Inscrits ({matchedEnrollments.length})</h4>
                      {matchedEnrollments.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucun étudiant inscrit dans cette session.</p>
                      ) : (
                        <div className="students-list space-y-2">
                          {matchedEnrollments.map((en: any) => {
                            const u = usersById.get(en.user_id);
                            return (
                              <div key={en.id} className="student-item flex justify-between items-center p-2 bg-slate-50 rounded">
                                <span className="student-name text-sm">
                                  {u ? `${u.firstName} ${u.lastName}` : `User #${en.user_id}`}
                                </span>
                                <span className="student-email text-xs text-slate-500">
                                  {u ? u.email : 'Unknown'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCourseDetailsPage;
