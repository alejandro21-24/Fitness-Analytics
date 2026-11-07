const fs = require('fs');
const csv = require('csv-parser');

// Lee el CSV con csv-parser y lo envuelve en una Promise para usar async/await
function readWorkoutData(filepath) {
  return new Promise((resolve, reject) => {
    const results = [];

    // .pipe() no pasa los errores del stream de lectura (ej. archivo inexistente),
    // por eso también escuchamos 'error' directamente en el createReadStream
    const stream = fs.createReadStream(filepath);
    stream.on('error', (error) => {
      reject(error);
    });

    stream
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Busca el valor de los minutos en la fila (acepta varios nombres de columna comunes)
function getMinutes(row) {
  const columns = ['minutes', 'duration', 'duration_minutes', 'durationMinutes', 'Minutes', 'Duration'];
  for (let i = 0; i < columns.length; i++) {
    if (row[columns[i]] !== undefined) {
      return parseFloat(row[columns[i]]);
    }
  }
  return NaN;
}

// Cuenta los entrenamientos y suma los minutos. Devuelve { totalWorkouts, totalMinutes } o null
async function workoutCalculator(filepath) {
  try {
    const workouts = await readWorkoutData(filepath);
    const totalWorkouts = workouts.length;
    let totalMinutes = 0;

    // Ciclo for básico, como pide la tarea
    for (let i = 0; i < workouts.length; i++) {
      const minutes = getMinutes(workouts[i]);
      if (Number.isNaN(minutes)) {
        throw new Error(`Invalid or missing minutes value in row ${i + 1}`);
      }
      totalMinutes += minutes;
    }

    console.log('Total workouts:', totalWorkouts);
    console.log('Total minutes:', totalMinutes);
    return { totalWorkouts, totalMinutes };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('❌ Workout CSV file not found - check the file path');
    } else {
      console.log('❌ Error processing workout CSV file:', error.message);
    }
    return null;
  }
}

module.exports = { readWorkoutData, workoutCalculator };