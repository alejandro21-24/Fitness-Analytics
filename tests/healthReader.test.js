const fs = require('fs/promises');

// Lee un archivo JSON de forma asíncrona y devuelve el objeto/arreglo ya convertido
async function readHealthData(filepath) {
  const data = await fs.readFile(filepath, 'utf8');
  return JSON.parse(data);
}

// Encuentra la lista de entradas dentro del JSON:
// puede ser un arreglo directo o un objeto que contiene un arreglo (ej. { entries: [...] })
function findEntries(parsed) {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    for (let i = 0; i < keys.length; i++) {
      if (Array.isArray(parsed[keys[i]])) {
        return parsed[keys[i]];
      }
    }
  }
  throw new Error('No health entries array found in JSON');
}

// Cuenta las entradas de salud. Devuelve { totalEntries } o null si hay un error
async function healthMetricsCounter(filepath) {
  try {
    const parsed = await readHealthData(filepath);
    const entries = findEntries(parsed);
    const totalEntries = entries.length;
    console.log('Total health entries:', totalEntries);
    return { totalEntries };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('❌ Health file not found - check the file path');
    } else if (error.name === 'SyntaxError') {
      console.log('❌ Invalid JSON - check the file format');
    } else {
      console.log('❌ Error processing health file:', error.message);
    }
    return null;
  }
}

module.exports = { readHealthData, healthMetricsCounter };