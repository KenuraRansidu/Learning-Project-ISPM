export const END_POINTS = {
    GET_CERTIFICATE_DATA: "/api/certificate_data",
    GET_COURSES: "api/courses",
    GET_LESSONS: "api/lessons",
    GET_COURSE_BY_ID: (id) => `api/courses/${id}`,
    SAVE_PROGRESS: "/api/progress/save",
  GET_ALL_ADMIN_REQUEST: "/api/certificate-requests/all",
  TOGGLE_CERTIFICATE_STATUS: (id) => `/api/certificate-requests/certificates/${id}/toggle`,
    // ✅ Add this line
    CREATE_CERTIFICATE_REQUEST: "/api/certificate_data",
    DELETE_CERTIFICATE_REQUEST: (id) => `/api/certificate-requests/${id}`,
  };
