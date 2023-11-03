function formatDateToPTBR(dateString) {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Os meses vão de 0 a 11, então adicionamos +1 para corrigir.
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}
