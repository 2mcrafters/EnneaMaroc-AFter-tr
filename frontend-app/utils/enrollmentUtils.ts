import { Enrollment } from '../services/enrollmentService';

/**
 * Enrichit les inscriptions avec les données de groupe basées sur group_id
 * Cela permet de maintenir la compatibilité avec le code existant qui utilise group_data
 */
export const enrichEnrollmentsWithGroupData = (
  enrollments: Enrollment[],
  courses: any[] = []
): Enrollment[] => {
  return enrollments.map(enrollment => {
    // Si group_data existe déjà (venant du backend), on le garde
    if (enrollment.group_data) {
      return enrollment;
    }

    // Sinon, on crée group_data à partir de group_id
    let groupData = null;

    if (enrollment.course_id && enrollment.group_id) {
      // Pour les cours, chercher dans la liste des cours
      const course = courses.find(c => String(c.id) === String(enrollment.course_id));
      if (course && course.groups) {
        groupData = course.groups.find(g => String(g.id) === String(enrollment.group_id));
      }
    }

    return {
      ...enrollment,
      group_data: groupData
    };
  });
};

/**
 * Enrichit une seule inscription avec les données de groupe
 */
export const enrichEnrollmentWithGroupData = (
  enrollment: Enrollment,
  courses: any[] = []
): Enrollment => {
  return enrichEnrollmentsWithGroupData([enrollment], courses)[0];
};