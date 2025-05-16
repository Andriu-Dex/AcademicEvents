export const login = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email.endsWith('@uta.edu.ec')) {
        return reject({ message: 'Correo no institucional.' });
      }

      if (email === 'estudiante@uta.edu.ec' && password === '123456') {
        return resolve({ user: { name: 'Estudiante UTA', email } });
      }

      return reject({ message: 'Credenciales incorrectas.' });
    }, 1000); // simula una espera de 1 segundo
  });
};
