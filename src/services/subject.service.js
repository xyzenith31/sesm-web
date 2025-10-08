import axios from 'axios';

// Pastikan URL ini sesuai dengan alamat backend Anda
const API_URL = 'http://localhost:8080/api/subjects';

const getSubjects = (jenjang, kelas) => {
  let url = `${API_URL}/${jenjang}`;

  // Hanya tambahkan parameter kelas jika jenjang adalah 'sd'
  if (jenjang && jenjang.toLowerCase() === 'sd' && kelas) {
    url += `/${kelas}`;
  }

  return axios.get(url);
};

const SubjectService = {
  getSubjects,
};

export default SubjectService;